import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, User, BookOpen, Clock, 
  Search, FileDown, ThumbsUp, ThumbsDown, Check, 
  MessageSquare, Play, FileCheck, X, Send, Award
} from 'lucide-react';
import { getCourseMaterials } from '../../services/studentPortalService';
import { getDepartmentsAPI } from '../../api/auth';
import { toast } from 'react-hot-toast';

interface CourseMaterial {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  category: string;
  courseId: number;
  facultyId: number;
  createdAt: string;
  course?: {
    name: string;
    code: string;
    semester: number;
    departmentId: number;
  } | null;
  faculty?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface StudentStudyMaterialsProps {
  defaultDepartmentId?: number;
  defaultSemester?: number;
}

const StudentStudyMaterials: React.FC<StudentStudyMaterialsProps> = ({ 
  defaultDepartmentId, 
  defaultSemester 
}) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active views selection
  const [activeSubjectCode, setActiveSubjectCode] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Notes Synopsis/E-material');

  // Sidebar Filter Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'subject' | 'faculty'>('subject');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    defaultDepartmentId ? String(defaultDepartmentId) : ''
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    defaultSemester ? String(defaultSemester) : ''
  );

  // Mock comments state
  const [activeCommentsFile, setActiveCommentsFile] = useState<CourseMaterial | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mockCommentsList, setMockCommentsList] = useState<Record<number, Array<{ author: string; date: string; content: string }>>>({});

  // Category listing
  const categories = [
    'Notes Synopsis/E-material',
    'Assignments',
    'University Paper Sets',
    'Question Bank',
    'Syllabus',
    'Video',
    'Ebook',
    'Lecture Note/OHPs/PPTs'
  ];

  // Fetch departments and materials
  const loadDepartments = async () => {
    try {
      const depts = await getDepartmentsAPI();
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = {
        semester: selectedSemester,
        departmentId: selectedDeptId,
        search: searchQuery,
        searchMode: searchMode
      };
      const data = await getCourseMaterials(params);
      setMaterials(data);

      // Auto-select the first subject code from retrieved materials
      const uniqueCodes = Array.from(new Set(data.map((m: CourseMaterial) => m.course?.code).filter(Boolean)));
      if (uniqueCodes.length > 0) {
        // If current active code is not in the new list, reset to first one
        if (!uniqueCodes.includes(activeSubjectCode)) {
          setActiveSubjectCode(String(uniqueCodes[0]));
        }
      } else {
        setActiveSubjectCode('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    fetchMaterials();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaterials();
  };

  const handleDownload = (path: string, fileName: string) => {
    const fullUrl = `http://localhost:5000${path}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${fileName}...`);
  };

  // Get unique subjects/courses from the currently fetched materials
  const uniqueCourses = React.useMemo(() => {
    const courseMap = new Map<string, { code: string; name: string }>();
    materials.forEach(m => {
      if (m.course?.code) {
        courseMap.set(m.course.code, {
          code: m.course.code,
          name: m.course.name
        });
      }
    });
    return Array.from(courseMap.values());
  }, [materials]);

  // Filter materials for active subject
  const activeCourseMaterials = React.useMemo(() => {
    return materials.filter(m => m.course?.code === activeSubjectCode);
  }, [materials, activeSubjectCode]);

  // Filter materials for active category
  const filteredFiles = React.useMemo(() => {
    return activeCourseMaterials.filter(m => m.category === activeCategory);
  }, [activeCourseMaterials, activeCategory]);

  const activeCourse = uniqueCourses.find(c => c.code === activeSubjectCode);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Video':
        return <Play size={18} />;
      case 'Syllabus':
        return <FileCheck size={18} />;
      case 'Assignments':
        return <FileText size={18} />;
      case 'Notes Synopsis/E-material':
      case 'Lecture Note/OHPs/PPTs':
      case 'Ebook':
        return <BookOpen size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  // Comments interaction
  const handleShowComments = (file: CourseMaterial) => {
    setActiveCommentsFile(file);
    if (!mockCommentsList[file.id]) {
      const generated = [
        {
          author: 'Alice Cooper (ECE)',
          date: '2 days ago',
          content: 'This was exactly what was asked in the midterm exam! Thank you!'
        },
        {
          author: 'Robert Downey (CS)',
          date: 'Yesterday',
          content: 'Can someone explain the derivation on page 4? The formula seems slightly off.'
        },
        {
          author: 'Sarah Connor (CS)',
          date: 'Today at 10:14 AM',
          content: 'Verified this with the recommended reference textbook. It is correct.'
        }
      ].slice(0, (file.id % 3) + 1);
      
      setMockCommentsList(prev => ({
        ...prev,
        [file.id]: generated
      }));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentsFile) return;
    
    const newComment = {
      author: 'You (Student)',
      date: 'Just now',
      content: commentText.trim()
    };

    setMockCommentsList(prev => ({
      ...prev,
      [activeCommentsFile.id]: [...(prev[activeCommentsFile.id] || []), newComment]
    }));
    setCommentText('');
    toast.success('Comment posted successfully (mock)!');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-gray-100 relative">
      
      {/* Page Title Header */}
      <div>
        <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          E-content (Download)
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Access your notes, assignments, syllabi, and reference materials. Use the sidebar to filter resources.
        </p>
      </div>

      {/* Main Grid: Left content, Right filter sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main content panel (9 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Subject Tab Bar */}
          <div className="bg-[#111827]/70 border border-gray-800 rounded-3xl p-5 shadow-xl">
            <h5 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Select Subject</h5>
            {uniqueCourses.length === 0 ? (
              <div className="text-sm text-gray-500 py-3 italic">
                No courses with materials found matching the search criteria.
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {uniqueCourses.map((course) => (
                  <button
                    key={course.code}
                    onClick={() => setActiveSubjectCode(course.code)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black tracking-wider transition-all border shrink-0 ${
                      activeSubjectCode === course.code
                        ? 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5'
                        : 'bg-[#1e293b]/30 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    {course.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Course Details & Category Pills */}
          {activeSubjectCode && (
            <div className="bg-[#111827]/70 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Heading and Faculty Coral Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-5">
                <div>
                  <h4 className="text-lg font-extrabold text-white leading-snug">
                    {activeCourse ? activeCourse.name : activeSubjectCode}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Subject Code: <strong className="text-indigo-400">{activeSubjectCode}</strong>
                  </p>
                </div>
                
                {/* Faculty details tag */}
                {activeCourseMaterials.length > 0 && activeCourseMaterials[0].faculty && (
                  <div className="flex items-center gap-2 bg-[#ff5555]/10 border border-[#ff5555]/20 text-[#ff5555] px-4 py-2 rounded-full text-xs font-black tracking-wider self-start sm:self-center">
                    <User size={13} />
                    <span>
                      {activeCourseMaterials[0].facultyId} {activeCourseMaterials[0].faculty.name.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Category selector pills */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Material Categories</h5>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const count = activeCourseMaterials.filter(m => m.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                          activeCategory === cat
                            ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 shadow-md shadow-blue-500/5'
                            : 'bg-[#1e293b]/20 border-gray-850 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            activeCategory === cat 
                              ? 'bg-blue-500 text-white shadow-sm' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matching files list */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Files in {activeCategory}
                  </h5>
                  <span className="text-[10px] bg-[#1e293b] text-gray-400 px-2.5 py-1 rounded-full font-bold border border-gray-800">
                    Total: {filteredFiles.length}
                  </span>
                </div>

                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-850 rounded-2xl text-center">
                    <FileDown className="text-gray-700 mb-3" size={36} />
                    <h6 className="font-bold text-gray-400 text-xs">No materials published</h6>
                    <p className="text-[10px] text-gray-600 max-w-xs mt-1">
                      No files have been uploaded under this category for {activeSubjectCode} yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFiles.map((file) => {
                      // Seeded mock data counters based on ID
                      const isVerified = true;
                      const upvotes = (file.id * 11) % 19 + 5;
                      const downvotes = (file.id * 3) % 4;
                      const comments = mockCommentsList[file.id]?.length ?? ((file.id * 2) % 4 + 1);

                      return (
                        <div 
                          key={file.id} 
                          className="bg-gray-900/30 hover:bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                              {getCategoryIcon(file.category)}
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-sm leading-snug group-hover:text-blue-400 transition-colors">
                                {file.title}
                              </h5>
                              {file.description && (
                                <p className="text-xs text-gray-450 mt-1 line-clamp-2 max-w-lg">{file.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </span>
                                
                                <span className="w-1 h-1 rounded-full bg-gray-800"></span>

                                {isVerified && (
                                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                                    <Check size={10} />
                                    Verified
                                  </span>
                                )}

                                <span className="w-1 h-1 rounded-full bg-gray-800"></span>

                                <div className="flex items-center gap-2 text-gray-400">
                                  <button className="flex items-center gap-1 hover:text-blue-400 transition-colors" title="Like">
                                    <ThumbsUp size={11} />
                                    <span>{upvotes}</span>
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-rose-400 transition-colors" title="Dislike">
                                    <ThumbsDown size={11} />
                                    <span>{downvotes}</span>
                                  </button>
                                </div>

                                <span className="w-1 h-1 rounded-full bg-gray-800"></span>

                                <button 
                                  onClick={() => handleShowComments(file)}
                                  className="flex items-center gap-1 hover:text-indigo-400 text-indigo-400/90 transition-colors"
                                >
                                  <MessageSquare size={11} />
                                  <span>{comments} {comments === 1 ? 'comment' : 'comments'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleDownload(file.fileUrl, file.fileName)}
                              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                            >
                              <Download size={13} />
                              Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Right Filter Sidebar (4 Columns) */}
        <div className="lg:col-span-4 sticky top-6">
          <form onSubmit={handleSearchSubmit} className="bg-[#111827]/70 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-6">
            
            <div className="border-b border-gray-850 pb-4">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Search size={18} className="text-blue-400" />
                Search Filters
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">Refine e-content resources dynamically.</p>
            </div>

            {/* Search Focus Selection Tab */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Search Focus</label>
              <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setSearchMode('subject')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    searchMode === 'subject'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Subject
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('faculty')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    searchMode === 'faculty'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Faculty
                </button>
              </div>
            </div>

            {/* Text Search Box */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchMode === 'subject' ? "Search Subject/Topic..." : "Search Faculty Name..."}
                  className="w-full bg-[#1e293b]/50 border border-gray-700 text-white text-xs rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-650"
                />
              </div>
            </div>

            {/* Branch Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Branch / Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-[#1e293b]/50 border border-gray-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selection Radios */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Semester</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedSemester === ''
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                    : 'bg-[#1e293b]/20 border-gray-800 text-gray-450 hover:text-white hover:border-gray-750'
                }`}>
                  <input
                    type="radio"
                    name="semester"
                    value=""
                    checked={selectedSemester === ''}
                    onChange={() => setSelectedSemester('')}
                    className="hidden"
                  />
                  <span>All Semesters</span>
                </label>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <label key={sem} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedSemester === String(sem)
                      ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                      : 'bg-[#1e293b]/20 border-gray-800 text-gray-450 hover:text-white hover:border-gray-750'
                  }`}>
                    <input
                      type="radio"
                      name="semester"
                      value={sem}
                      checked={selectedSemester === String(sem)}
                      onChange={() => setSelectedSemester(String(sem))}
                      className="hidden"
                    />
                    <span>Semester {sem}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Search Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                'SEARCH'
              )}
            </button>

          </form>
        </div>

      </div>

      {/* Mock Comments Dialog overlay drawer */}
      {activeCommentsFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md h-full bg-[#0b0f17] border-l border-gray-850 shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-350">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-850 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="text-blue-400" size={20} />
                  <div>
                    <h5 className="font-bold text-white text-sm max-w-[280px] truncate">
                      {activeCommentsFile.title}
                    </h5>
                    <p className="text-[10px] text-gray-500">Discussion Board</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveCommentsFile(null)}
                  className="p-1.5 bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Comments List Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent mb-4">
              {(mockCommentsList[activeCommentsFile.id] || []).length === 0 ? (
                <div className="text-center py-20 text-gray-650 text-xs italic">
                  No discussions yet. Start the conversation!
                </div>
              ) : (
                (mockCommentsList[activeCommentsFile.id] || []).map((comment, index) => (
                  <div key={index} className="bg-gray-900/40 border border-gray-850/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        {comment.author.startsWith('You') && <Award size={12} className="text-amber-400" />}
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-gray-550">{comment.date}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Comment Form */}
            <form onSubmit={handleAddComment} className="border-t border-gray-850 pt-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Post an academic inquiry or review..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-gray-700 text-white text-xs rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-550"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentStudyMaterials;
