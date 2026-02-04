import React, { useState, useEffect } from 'react';
import { uploadInsightCreatives } from '../api';

// --- Helper Component for File Previews ---
const FilePreview = ({ file }: { file: File | null }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    let objectUrl: string | null = null;

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4 animate-fade-in">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-md border border-blue-200 overflow-hidden flex items-center justify-center">
        {file.type.startsWith('image/') && preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : file.type.startsWith('video/') && preview ? (
          <video src={preview} className="w-full h-full object-cover" muted />
        ) : (
          <i className="ri-file-text-line text-2xl text-blue-400"></i>
        )}
      </div>

      {/* File Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-xs text-blue-600 mt-0.5 capitalize">
          {file.type.split('/')[0]}
        </p>
      </div>
      
      {/* Valid Indicator */}
      <div className="flex-shrink-0 text-green-500">
        <i className="ri-checkbox-circle-fill text-xl"></i>
      </div>
    </div>
  );
};

// --- Types ---

interface EngagementData {
  libraryName: string;
  state: string;
  language: string;
  date: string;
  type: 'photo' | 'video' | 'creative';
  category: string;
  subCategory?: string;
  party?: string;
  creatives: (File | null)[];
  caption: string; 
}

// --- Main Component ---

export default function EngagementLibrary() {
  const [contentType, setContentType] = useState<'carousel' | 'reels' | 'insight' | ''>('');
  const [resetKey, setResetKey] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Constants
  const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'];
  const languages = ['English', 'Hindi', 'Assamese', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Marathi', 'Odia', 'Punjabi', 'Tamil', 'Telugu', 'Urdu'];
  const categories = ['Politics', 'Awareness', 'Government Schemes', 'Trends', 'Festive', 'Health', 'Education', 'Technology', 'Environment', 'Sports', 'Tourism', 'Motivation', 'Culture', 'Lifestyle'];

  // Form States
  const [carouselFormData, setCarouselFormData] = useState<EngagementData>({
    libraryName: '', state: '', language: '', date: '', type: 'photo', category: '', party: '', creatives: new Array(5).fill(null), caption: ''
  });

  const [reelsFormData, setReelsFormData] = useState<EngagementData>({
    libraryName: '', state: '', language: '', date: '', type: 'video', category: '', party: '', creatives: new Array(1).fill(null), caption: ''
  });

  const [insightFormData, setInsightFormData] = useState<EngagementData>({
    libraryName: '', state: '', language: '', date: '', type: 'creative', category: '', party: '', creatives: new Array(1).fill(null), caption: ''
  });

  // --- Helpers ---

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setContentType('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Reset Data
    const base = { libraryName: '', state: '', language: '', date: '', category: '', party: '', caption: '' };
    setCarouselFormData({ ...base, type: 'photo', creatives: new Array(5).fill(null) });
    setReelsFormData({ ...base, type: 'video', creatives: new Array(1).fill(null) });
    setInsightFormData({ ...base, type: 'creative', creatives: new Array(1).fill(null) });
  };

  // --- Handlers ---

  const handleSubmit = async (e: React.FormEvent, data: EngagementData) => {
    e.preventDefault();
    const validCreatives = data.creatives.filter(f => f !== null) as File[];
    
    if (validCreatives.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await uploadInsightCreatives(
        data.libraryName,
        formatDate(data.date),
        [data.caption],
        data.state,
        data.language,
        data.type,
        validCreatives,
        data.party || "",
        data.category
      );

      if (response.success) {
        handleReset();
      } else {
        alert(`Upload failed: ${response.message || 'Unknown error'}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative p-4">
      
      {/* --- Loader Overlay --- */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-700 font-semibold text-lg">Uploading Content...</p>
          </div>
        </div>
      )}

      {/* --- Success Notification --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-check-line text-4xl text-green-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 text-center">Content uploaded successfully.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Engagement Library</h2>
          <p className="text-gray-600">Manage interactive content for your audience.</p>
        </div>

        {/* --- Selection Grid (3 Columns) --- */}
        {!contentType && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Content Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Carousels */}
              <div onClick={() => setContentType('carousel')} className="group border-2 border-gray-100 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <i className="ri-stack-line text-blue-600 text-2xl group-hover:text-white"></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Carousels</h4>
                </div>
                <p className="text-gray-600 text-sm">Upload up to 5 images/videos with a shared caption.</p>
              </div>

              {/* Reels */}
              <div onClick={() => setContentType('reels')} className="group border-2 border-gray-100 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <i className="ri-video-line text-purple-600 text-2xl group-hover:text-white"></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Reels Upload</h4>
                </div>
                <p className="text-gray-600 text-sm">Upload 1 MP4 video reel with a dedicated caption.</p>
              </div>

              {/* Insights (NEW Section) */}
              <div onClick={() => setContentType('insight')} className="group border-2 border-gray-100 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                    <i className="ri-lightbulb-line text-amber-600 text-2xl group-hover:text-white"></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Insights</h4>
                </div>
                <p className="text-gray-600 text-sm">Upload 1 single image insight with a dedicated caption.</p>
              </div>

            </div>
          </div>
        )}

        {/* --- Carousel Form --- */}
        {contentType === 'carousel' && (
          <form onSubmit={(e) => handleSubmit(e, carouselFormData)} className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Carousel Upload (Up to 5 items)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Library Name *" value={carouselFormData.libraryName} onChange={e => setCarouselFormData({...carouselFormData, libraryName: e.target.value})} className="border p-2 rounded-lg" required />
              <input type="date" value={carouselFormData.date} onChange={e => setCarouselFormData({...carouselFormData, date: e.target.value})} className="border p-2 rounded-lg" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={carouselFormData.state} onChange={e => setCarouselFormData({...carouselFormData, state: e.target.value})} className="border p-2 rounded-lg" required>
                <option value="">Select State *</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={carouselFormData.language} onChange={e => setCarouselFormData({...carouselFormData, language: e.target.value})} className="border p-2 rounded-lg" required>
                <option value="">Select Language *</option>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={carouselFormData.category} onChange={e => setCarouselFormData({...carouselFormData, category: e.target.value})} className="border p-2 rounded-lg" required>
                <option value="">Select Category *</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <textarea placeholder="Shared caption for all items..." value={carouselFormData.caption} onChange={e => setCarouselFormData({...carouselFormData, caption: e.target.value})} className="w-full border p-3 rounded-lg" rows={3} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselFormData.creatives.map((file, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                  <label className="text-xs font-bold text-gray-500 uppercase">Slot {idx+1}</label>
                  <input type="file" key={`c-${idx}-${resetKey}`} onChange={e => {
                    const newFiles = [...carouselFormData.creatives];
                    newFiles[idx] = e.target.files ? e.target.files[0] : null;
                    setCarouselFormData({...carouselFormData, creatives: newFiles});
                  }} className="block w-full text-xs mt-1" />
                  <FilePreview file={file} />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setContentType('')} className="px-6 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Carousel</button>
            </div>
          </form>
        )}

        {/* --- Reels Form --- */}
        {contentType === 'reels' && (
          <form onSubmit={(e) => handleSubmit(e, reelsFormData)} className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Reel Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Library Name *" value={reelsFormData.libraryName} onChange={e => setReelsFormData({...reelsFormData, libraryName: e.target.value})} className="border p-2 rounded-lg" required />
              <input type="date" value={reelsFormData.date} onChange={e => setReelsFormData({...reelsFormData, date: e.target.value})} className="border p-2 rounded-lg" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <select value={reelsFormData.state} onChange={e => setReelsFormData({...reelsFormData, state: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select State *</option>{states.map(s => <option key={s}>{s}</option>)}
               </select>
               <select value={reelsFormData.language} onChange={e => setReelsFormData({...reelsFormData, language: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select Language *</option>{languages.map(l => <option key={l}>{l}</option>)}
               </select>
               <select value={reelsFormData.category} onChange={e => setReelsFormData({...reelsFormData, category: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select Category *</option>{categories.map(c => <option key={c}>{c}</option>)}
               </select>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Video File (MP4) *</label>
              <input type="file" accept="video/mp4" key={`r-${resetKey}`} onChange={e => {
                setReelsFormData({...reelsFormData, creatives: [e.target.files ? e.target.files[0] : null]});
              }} className="w-full text-sm" required />
              <FilePreview file={reelsFormData.creatives[0]} />
              
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Caption *</label>
                <textarea value={reelsFormData.caption} onChange={e => setReelsFormData({...reelsFormData, caption: e.target.value})} className="w-full border p-3 rounded-lg" rows={4} placeholder="Enter reel caption..." required />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setContentType('')} className="px-6 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit Reel</button>
            </div>
          </form>
        )}

        {/* --- Insights Form (Functionality similar to Reels, but for Photos) --- */}
        {contentType === 'insight' && (
          <form onSubmit={(e) => handleSubmit(e, insightFormData)} className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Insight Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Library Name *" value={insightFormData.libraryName} onChange={e => setInsightFormData({...insightFormData, libraryName: e.target.value})} className="border p-2 rounded-lg" required />
              <input type="date" value={insightFormData.date} onChange={e => setInsightFormData({...insightFormData, date: e.target.value})} className="border p-2 rounded-lg" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <select value={insightFormData.state} onChange={e => setInsightFormData({...insightFormData, state: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select State *</option>{states.map(s => <option key={s}>{s}</option>)}
               </select>
               <select value={insightFormData.language} onChange={e => setInsightFormData({...insightFormData, language: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select Language *</option>{languages.map(l => <option key={l}>{l}</option>)}
               </select>
               <select value={insightFormData.category} onChange={e => setInsightFormData({...insightFormData, category: e.target.value})} className="border p-2 rounded-lg" required>
                 <option value="">Select Category *</option>{categories.map(c => <option key={c}>{c}</option>)}
               </select>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Insight Image (JPG/PNG) *</label>
              <input type="file" accept="image/*" key={`i-${resetKey}`} onChange={e => {
                setInsightFormData({...insightFormData, creatives: [e.target.files ? e.target.files[0] : null]});
              }} className="w-full text-sm" required />
              <FilePreview file={insightFormData.creatives[0]} />
              
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Caption *</label>
                <textarea value={insightFormData.caption} onChange={e => setInsightFormData({...insightFormData, caption: e.target.value})} className="w-full border p-3 rounded-lg" rows={4} placeholder="Enter insight caption..." required />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setContentType('')} className="px-6 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Submit Insight</button>
            </div>
          </form>
        )}

        {/* --- Back Button --- */}
        {contentType && (
          <div className="mt-8 pt-4 border-t">
            <button onClick={() => setContentType('')} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2">
              <i className="ri-arrow-left-line"></i> Back to Content Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}