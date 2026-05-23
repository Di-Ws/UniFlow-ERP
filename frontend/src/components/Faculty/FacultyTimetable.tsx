import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Clock, BookOpen, MapPin, 
  Layers, Calendar, X, AlertCircle 
} from 'lucide-react';
import { 
  getTimetable, createTimetableSlot, updateTimetableSlot, 
  deleteTimetableSlot, getMyCourses 
} from '../../services/facultyService';
import { toast } from 'react-hot-toast';

interface TimetableSlot {
  id: number;
  facultyId: number;
  courseId: number | null;
  subject: string;
  section: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  type: string;
  course?: {
    id: number;
    name: string;
    code: string;
    semester: number;
  } | null;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_TYPES = ['Lecture', 'Lab', 'Tutorial', 'Seminar'];

const FacultyTimetable: React.FC = () => {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    courseId: '',
    subject: '',
    section: '',
    room: '',
    startTime: '',
    endTime: '',
    dayOfWeek: 'Monday',
    type: 'Lecture'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsData, coursesData] = await Promise.all([
        getTimetable(),
        getMyCourses()
      ]);
      setSlots(slotsData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load timetable or courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setFormData({
      courseId: courses[0]?.id ? String(courses[0].id) : '',
      subject: courses[0]?.name || '',
      section: '',
      room: '',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      dayOfWeek: 'Monday',
      type: 'Lecture'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      courseId: slot.courseId ? String(slot.courseId) : '',
      subject: slot.subject || '',
      section: slot.section || '',
      room: slot.room || '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      dayOfWeek: slot.dayOfWeek || 'Monday',
      type: slot.type || 'Lecture'
    });
    setIsModalOpen(true);
  };

  const handleCourseChange = (courseIdStr: string) => {
    const selectedCourse = courses.find(c => String(c.id) === courseIdStr);
    setFormData(prev => ({
      ...prev,
      courseId: courseIdStr,
      subject: selectedCourse ? selectedCourse.name : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      toast.error('Please assign a course to this schedule slot.');
      return;
    }

    try {
      const payload = {
        ...formData,
        courseId: Number(formData.courseId)
      };

      if (editingSlot) {
        await updateTimetableSlot(editingSlot.id, payload);
        toast.success('Schedule slot updated successfully!');
      } else {
        await createTimetableSlot(payload);
        toast.success('Schedule slot created successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save timetable slot.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule slot?')) {
      try {
        await deleteTimetableSlot(id);
        toast.success('Schedule slot deleted successfully.');
        fetchData();
      } catch (err: any) {
        toast.error('Failed to delete slot.');
      }
    }
  };

  // Filter slots by selected semester
  const filteredSlots = slots.filter(slot => {
    if (selectedSemester === 'ALL') return true;
    return slot.course?.semester === selectedSemester;
  });

  // Group slots by day
  const groupedSlots = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = filteredSlots.filter(s => s.dayOfWeek === day);
    return acc;
  }, {} as Record<string, TimetableSlot[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Timetable Planner</h3>
          <p className="text-sm text-gray-400 mt-1">Manage and structure your weekly classes and labs by student semesters.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={courses.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold text-sm"
        >
          <Plus size={18} />
          Add Schedule Slot
        </button>
      </div>

      {courses.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p className="text-sm">
            <strong>No Courses Assigned:</strong> You are not currently assigned to teach any course in the HOD ERP. Please ask your department HOD to assign courses to your faculty profile before planning your schedule.
          </p>
        </div>
      )}

      {/* Semester Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider mr-2">Semester:</span>
        <button
          onClick={() => setSelectedSemester('ALL')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedSemester === 'ALL'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-850 hover:bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          All Semesters
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedSemester === sem
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-850 hover:bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {/* Timetable List categorized by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DAYS_OF_WEEK.map(day => {
          const daySlots = groupedSlots[day] || [];
          return (
            <div key={day} className="bg-[#111827]/70 border border-gray-800 rounded-2xl p-5 shadow flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Calendar className="text-blue-400" size={16} />
                    {day}
                  </h4>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                    {daySlots.length} {daySlots.length === 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {daySlots.length > 0 ? (
                    daySlots.map(slot => (
                      <div 
                        key={slot.id} 
                        className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 transition-all group relative"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-bold text-sm text-gray-200 leading-tight pr-12">{slot.subject}</h5>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            slot.type === 'Lab' 
                              ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-850'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-850'
                          }`}>
                            {slot.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-1.5 mt-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-500" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Layers size={12} className="text-gray-500" />
                            <span>Sec {slot.section || 'N/A'} (Sem {slot.course?.semester})</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <MapPin size={12} className="text-gray-500" />
                            <span>Room: <strong className="text-gray-300">{slot.room || 'TBA'}</strong></span>
                          </div>
                        </div>

                        {/* Hover Edit/Delete Action Panel */}
                        <div className="absolute top-3.5 right-3.5 hidden group-hover:flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(slot)}
                            className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"
                            title="Edit Slot"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-1 hover:bg-red-950 text-gray-400 hover:text-red-400 rounded transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500 italic border border-dashed border-gray-800 rounded-xl">
                      No classes scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-blue-400" />
                {editingSlot ? 'Edit Schedule Slot' : 'Add Schedule Slot'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Select Course / Subject
                </label>
                <select
                  required
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="" disabled>-- Choose Course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code}) - Sem {course.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    Section
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A"
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LH-204"
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    value={formData.room}
                    onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:00 AM"
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    Day of Week
                  </label>
                  <select
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                    Slot Class Type
                  </label>
                  <select
                    className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {SLOT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-850 hover:bg-gray-800 rounded-xl transition-all border border-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl transition-all shadow-lg"
                >
                  {editingSlot ? 'Save Changes' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyTimetable;
