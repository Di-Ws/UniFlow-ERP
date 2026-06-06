import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Trash2, BookOpen, Clock, 
  ExternalLink, Layers, AlertCircle, File, Eye 
} from 'lucide-react';
import { 
  getUploadedMaterials, uploadMaterial, deleteMaterial, 
  getMyCourses 
} from '../../services/facultyService';
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
    id: number;
    name: string;
    code: string;
    semester: number;
  } | null;
}

const FacultyContentUpload: React.FC = () => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [category, setCategory] = useState('Notes Synopsis/E-material');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsData, coursesData] = await Promise.all([
        getUploadedMaterials(),
        getMyCourses()
      ]);
      setMaterials(materialsData);
      setCourses(coursesData);
      if (coursesData.length > 0) {
        setCourseId(String(coursesData[0].id));
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch course materials or courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Limit file size to 20MB in frontend
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds the 20MB limit.');
        e.target.value = ''; // Reset input
        return;
      }
      setSelectedFile(file);
      if (!title) {
        // Auto-fill title with file name without extension
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(baseName);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!courseId) {
      toast.error('Please assign this material to a course.');
      return;
    }

    try {
      setUploading(true);

      // Read file as Base64
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        try {
          await uploadMaterial({
            title: title || selectedFile.name,
            description,
            fileName: selectedFile.name,
            fileData: base64String,
            courseId: Number(courseId),
            category
          });
          toast.success('Study material uploaded successfully!');
          
          // Reset form
          setTitle('');
          setDescription('');
          setCategory('Notes Synopsis/E-material');
          setSelectedFile(null);
          const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
          fetchData();
        } catch (err: any) {
          toast.error(err.message || 'Upload failed.');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Error reading local file.');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);

    } catch (err: any) {
      toast.error('Failed to prepare file upload.');
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this study material? This will remove the file from the server.')) {
      try {
        await deleteMaterial(id);
        toast.success('Study material deleted successfully.');
        fetchData();
      } catch (err: any) {
        toast.error('Failed to delete material.');
      }
    }
  };

  const getFullDownloadUrl = (path: string) => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-900 dark:text-gray-100">
      
      {/* Upload Column (5 Cols) */}
      <div className="lg:col-span-5">
        <div className="bg-[#111827]/70 border border-gray-800 rounded-3xl p-6 shadow-xl sticky top-4">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-850 pb-4">
            <Upload className="text-blue-400" size={22} />
            <div>
              <h4 className="font-extrabold text-white text-lg">Upload Materials</h4>
              <p className="text-xs text-gray-400 mt-0.5">Publish syllabus documents, readings, or slides.</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <p className="text-xs">
                You cannot upload materials because you aren't assigned to any courses. Please contact the HOD to resolve this.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Select Course / Subject
                </label>
                <select
                  required
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code}) - Sem {course.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Material Category
                </label>
                <select
                  required
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Notes Synopsis/E-material">Notes Synopsis/E-material</option>
                  <option value="Assignments">Assignments</option>
                  <option value="University Paper Sets">University Paper Sets</option>
                  <option value="Question Bank">Question Bank</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Video">Video</option>
                  <option value="Ebook">Ebook</option>
                  <option value="Lecture Note/OHPs/PPTs">Lecture Note/OHPs/PPTs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 1 Notes - Introduction"
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add brief details about the contents of this file..."
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                  Select File
                </label>
                <div className="relative border-2 border-dashed border-gray-750 hover:border-gray-600 rounded-2xl p-6 transition-all bg-gray-900/30 text-center flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="file-upload-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <FileText className="text-gray-500 mb-2" size={32} />
                  <span className="text-xs font-semibold text-gray-300">
                    {selectedFile ? selectedFile.name : 'Click or drag file here'}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, Word, PPT or Image up to 20MB'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 font-bold text-sm disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Uploading File...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Study Material
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* List Column (7 Cols) */}
      <div className="lg:col-span-7">
        <div className="bg-[#111827]/70 border border-gray-800 rounded-3xl p-6 shadow-xl min-h-[500px]">
          <div className="flex items-center justify-between mb-6 border-b border-gray-850 pb-4">
            <h4 className="font-extrabold text-white text-lg">Published Materials</h4>
            <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-bold">
              Total: {materials.length}
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-center border border-dashed border-gray-850 rounded-2xl">
              <File className="text-gray-700 mb-3" size={48} />
              <h5 className="font-bold text-gray-400 text-sm">No study materials published yet</h5>
              <p className="text-xs text-gray-600 max-w-xs mt-1">Use the upload panel to share resources with your enrolled course students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map(material => (
                <div 
                  key={material.id} 
                  className="bg-gray-900/50 hover:bg-gray-900/90 border border-gray-800 rounded-2xl p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm leading-snug group-hover:text-blue-400 transition-colors">
                        {material.title}
                      </h5>
                      {material.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-md">{material.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Layers size={11} />
                          {material.course?.name} ({material.course?.code})
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-700 hidden sm:inline"></span>
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          {material.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-700 hidden sm:inline"></span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(material.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={getFullDownloadUrl(material.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-750 transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 bg-rose-950/20 hover:bg-rose-950/60 text-gray-500 hover:text-rose-400 border border-transparent hover:border-rose-900/30 rounded-lg transition-all"
                      title="Delete material"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FacultyContentUpload;
