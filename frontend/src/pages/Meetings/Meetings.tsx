import React, { useState, useEffect } from 'react';
import { Video, Plus, X, BookOpen, Trash2, ExternalLink, Calendar, LogOut } from 'lucide-react';
import { getUser, getUserRole } from '../../utils/auth';
import { 
  getMeetingsAPI, 
  createMeetingAPI, 
  joinMeetingAPI, 
  leaveMeetingAPI, 
  deleteMeetingAPI 
} from '../../api/meetingApi';
import api from '../../api/axiosConfig';

const Meetings: React.FC = () => {
  const role = getUserRole();
  const currentUser = getUser();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [topic, setTopic] = useState('');
  const [deptId, setDeptId] = useState('');
  const [semester, setSemester] = useState('1');
  const [meetingLink, setMeetingLink] = useState('');
  const [courseId, setCourseId] = useState('');
  const [capacity, setCapacity] = useState('56');

  // Available data lists for form
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Local active session state
  const [activeMeetingId, setActiveMeetingId] = useState<number | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await getMeetingsAPI();
      setMeetings(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch virtual classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormMetadata = async () => {
    if (role === 'FACULTY' || role === 'HOD') {
      try {
        // Refresh active user details to get updated profile info (faculty/student department links)
        const meRes = await api.get('/auth/me');
        if (meRes.data) {
          localStorage.setItem('user', JSON.stringify(meRes.data));
        }

        // Fetch departments
        const deptsRes = await api.get('/auth/departments');
        setDepartments(deptsRes.data);
      } catch (err) {
        console.error('Error fetching metadata', err);
      }
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchFormMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select user's department on modal open
  useEffect(() => {
    if (isModalOpen) {
      const freshUser = getUser();
      if (role === 'HOD' && freshUser?.managedDept) {
        setDeptId(freshUser.managedDept.id.toString());
      } else if (role === 'FACULTY' && freshUser?.faculty) {
        setDeptId(freshUser.faculty.departmentId.toString());
      }
      // Defaults to Semester 1 if empty
      if (!semester) {
        setSemester('1');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, role]);

  // Reactive course fetcher on department/semester changes
  useEffect(() => {
    const fetchFilteredCourses = async () => {
      if (!deptId || !semester) {
        setCourses([]);
        return;
      }
      try {
        const coursesRes = await api.get(`/meetings/courses`, {
          params: {
            departmentId: parseInt(deptId),
            semester: parseInt(semester)
          }
        });
        setCourses(coursesRes.data);
        
        // Reset courseId if the currently selected course is not in the fetched list
        setCourseId((prev) => {
          if (prev && !coursesRes.data.some((c: any) => c.id.toString() === prev)) {
            return '';
          }
          return prev;
        });
      } catch (err) {
        console.error('Error fetching filtered courses', err);
        setCourses([]);
      }
    };

    if (role === 'FACULTY' || role === 'HOD') {
      fetchFilteredCourses();
    }
  }, [deptId, semester, role]);

  // Handle auto-release on tab close / unload
  useEffect(() => {
    const handleUnload = () => {
      if (activeMeetingId) {
        navigator.sendBeacon(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/meetings/${activeMeetingId}/leave`
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [activeMeetingId]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!topic || !deptId || !semester || !meetingLink) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await createMeetingAPI({
        topic,
        departmentId: parseInt(deptId),
        semester: parseInt(semester),
        meetingLink,
        courseId: courseId ? parseInt(courseId) : undefined,
        capacity: capacity ? parseInt(capacity) : 56
      });
      
      setSuccess('Virtual classroom session scheduled successfully.');
      setIsModalOpen(false);
      
      // Reset form
      setTopic('');
      setDeptId('');
      setSemester('1');
      setMeetingLink('');
      setCourseId('');
      setCapacity('56');
      
      fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create virtual classroom.');
    }
  };

  const handleJoin = async (meetingId: number) => {
    setError(null);
    try {
      const data = await joinMeetingAPI(meetingId);
      setSuccess('Join authorized. Opening classroom link...');
      setActiveMeetingId(meetingId);
      
      // Open link in new tab securely
      window.open(data.meetingLink, '_blank', 'noopener,noreferrer');
      
      // Refresh list to update counter
      fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Join authorization failed.');
    }
  };

  const handleLeave = async (meetingId: number) => {
    setError(null);
    try {
      await leaveMeetingAPI(meetingId);
      setSuccess('Released seat successfully.');
      if (activeMeetingId === meetingId) {
        setActiveMeetingId(null);
      }
      fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to release seat.');
    }
  };

  const handleDelete = async (meetingId: number) => {
    if (!window.confirm('Are you sure you want to end this session?')) return;
    setError(null);
    try {
      await deleteMeetingAPI(meetingId);
      setSuccess('Virtual classroom ended successfully.');
      if (activeMeetingId === meetingId) {
        setActiveMeetingId(null);
      }
      fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end session.');
    }
  };

  // Helper for progress bar color
  const getOccupancyColor = (current: number, cap: number) => {
    const percent = (current / cap) * 100;
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-dark-card/65 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary">
            <Video size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Virtual Classroom Sessions</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Secure institutional virtual meetings with capacity locking and semester isolation.
            </p>
          </div>
        </div>
        
        {(role === 'FACULTY' || role === 'HOD') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary hover:to-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 shrink-0"
          >
            <Plus size={20} /> Schedule Session
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold rounded-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          {success}
        </div>
      )}

      {/* In-Session Banner */}
      {activeMeetingId && (
        <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 p-5 rounded-3xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">You are currently active in a meeting session</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Click Exit to release your seat occupancy for other students.</p>
            </div>
          </div>
          <button 
            onClick={() => handleLeave(activeMeetingId)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
          >
            <LogOut size={16} /> Exit Class
          </button>
        </div>
      )}

      {/* Meetings Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Video size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Active Classes</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            There are no virtual classroom sessions scheduled for your department and semester at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => {
            const isCreator = meeting.faculty?.userId === currentUser?.id;
            const isHOD = role === 'HOD';
            const isActive = activeMeetingId === meeting.id;

            return (
              <div 
                key={meeting.id} 
                className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 rounded-full">
                      Sem {meeting.semester} • {meeting.department?.name || 'Dept'}
                    </span>
                    {(isCreator || isHOD) && (
                      <button 
                        onClick={() => handleDelete(meeting.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                        title="End Session"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {meeting.topic}
                  </h3>
                  
                  {meeting.course && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-3">
                      <BookOpen size={14} className="text-primary" />
                      <span className="font-semibold">{meeting.course.code} - {meeting.course.name}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>Host: {meeting.faculty?.name || 'Instructor'}</span>
                  </div>
                </div>

                {/* Counter and Seats Bar */}
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Occupied Seats</span>
                    <span className="text-gray-900 dark:text-white">
                      {meeting.activeParticipants} / {meeting.seatCap}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getOccupancyColor(meeting.activeParticipants, meeting.seatCap)}`}
                      style={{ width: `${Math.min((meeting.activeParticipants / meeting.seatCap) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-2">
                    {isActive ? (
                      <button 
                        onClick={() => handleLeave(meeting.id)}
                        className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Release Seat / Leave
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleJoin(meeting.id)}
                        disabled={meeting.activeParticipants >= meeting.seatCap}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          meeting.activeParticipants >= meeting.seatCap
                          ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 active:scale-98'
                        }`}
                      >
                        {meeting.activeParticipants >= meeting.seatCap ? 'Class Full' : <>Join securely <ExternalLink size={14} /></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#0f1322] border border-slate-100 dark:border-white/5 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl animate-scale-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Schedule Virtual Classroom
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
              Create a lock-restricted virtual session for target students.
            </p>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Topic/Title *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CS-302 Lecture: Compiler Design"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Department *
                  </label>
                  <select
                    required
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Semester *
                  </label>
                  <select
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Assigned Course (Optional)
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">No Course Link</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Raw Provider URL *
                </label>
                <input 
                  type="url" 
                  required
                  placeholder="https://zoom.us/j/... or Google Meet URL"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Maximum Capacity
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    placeholder="56"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 pb-2">
                    * Defaults to 56 participants
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-200 dark:border-white/10 dark:text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
