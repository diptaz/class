import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role } from '../types';
import { Video, Plus, Trash2, ExternalLink, PlayCircle } from 'lucide-react';

export const Videos = () => {
  const { videos, subjects, currentUser, addVideo, deleteVideo } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filterSubject, setFilterSubject] = useState('ALL');
  
  const [newVideo, setNewVideo] = useState({ title: '', url: '', subject: '', week: 1 });

  const canAdd = [Role.IT_LOGISTIK, Role.KURIKULUM, Role.ADMIN].includes(currentUser?.role as Role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Simple transform for youtube regular links to embed
    let finalUrl = newVideo.url;
    if (finalUrl.includes('youtube.com/watch?v=')) {
        finalUrl = finalUrl.replace('watch?v=', 'embed/');
    } else if (finalUrl.includes('youtu.be/')) {
        finalUrl = finalUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    }

    addVideo({
      id: Date.now().toString(),
      title: newVideo.title,
      url: finalUrl,
      subject: newVideo.subject,
      week: Number(newVideo.week),
      uploadedBy: currentUser.role
    });
    setShowModal(false);
    setNewVideo({ title: '', url: '', subject: '', week: 1 });
  };

  const filteredVideos = filterSubject === 'ALL' 
    ? videos 
    : videos.filter(v => v.subject === filterSubject);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video /> Class Videos
        </h1>
        {canAdd && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={18} /> Add Video
          </button>
        )}
      </div>

      <div className="mb-6">
        <select 
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group">
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative">
              <iframe 
                src={video.url} 
                className="w-full h-full" 
                title={video.title} 
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    Week {video.week}
                 </span>
                 {canAdd && (
                   <button 
                     onClick={() => deleteVideo(video.id)}
                     className="text-gray-400 hover:text-red-500"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{video.title}</h3>
              <p className="text-sm text-primary mt-1">{video.subject}</p>
              <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                 Uploaded by {video.uploadedBy}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredVideos.length === 0 && (
        <div className="text-center py-12 text-gray-400">No videos found.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add Video Material</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Video Title"
                required
                value={newVideo.title}
                onChange={e => setNewVideo({...newVideo, title: e.target.value})}
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="YouTube URL or Link"
                required
                value={newVideo.url}
                onChange={e => setNewVideo({...newVideo, url: e.target.value})}
              />
              <select 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                value={newVideo.subject}
                onChange={e => setNewVideo({...newVideo, subject: e.target.value})}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <input 
                type="number"
                min="1"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Week Number"
                required
                value={newVideo.week}
                onChange={e => setNewVideo({...newVideo, week: Number(e.target.value)})}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};