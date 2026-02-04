/* eslint-disable @typescript-eslint/no-explicit-any */
// Overview.tsx

import React, { useState, useEffect } from 'react';
import { uploadPostWithCreatives, getPostsByDateRange, updatePost, deletePost, updateCreativeImage } from '../api';
import ScriptLibrary from './ScriptLibrary';
import EngagementLibrary from './EngagementLibrary';

const MAX_CREATIVES = 5;

interface CalendarEntry {
  id: number;
  name: string;
  day: number;
  month: number;
  year: number;
  state: string;
  language: string | null;
  party: string | null;
  captions: { id: number; post_id: number; caption: string; createdAt: string; updatedAt: string }[];
  creatives: { id: number; creative_url: string; post_id: number; createdAt: string; updatedAt: string }[];
}

// Notification Interface
interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

const Overview: React.FC = () => {
  const [darkMode] = useState(false);
  const [state, setState] = useState('');
  const [language, setLanguage] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [title, setTitle] = useState('');
  
  // State updated to allow Strings (URLs) so we can update the view immediately after saving
  const [creativeFiles, setCreativeFiles] = useState<(File | string | null)[]>(Array(MAX_CREATIVES).fill(null));
  
  const [captions, setCaptions] = useState<string[]>(Array(MAX_CREATIVES).fill(''));
  const [activeTab, setActiveTab] = useState('script');
  const [, setCalendarDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [politicalParty, setPoliticalParty] = useState('');
  
  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar Entries State
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [selectedPost, setSelectedPost] = useState<CalendarEntry | null>(null);

  // DELETE MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // CENTRALIZED NOTIFICATION STATE
  const [notification, setNotification] = useState<NotificationState>({ 
    show: false, 
    type: 'success', 
    message: '' 
  });

  // Helper to trigger notification
  const triggerNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
  };

  // Handle file change for specific index
  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...creativeFiles];
    newFiles[index] = file;
    setCreativeFiles(newFiles);
  };

  const handleCaptionChange = (index: number, value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  // === UPDATED: Handle Save Single Creative ===
  const handleSaveSingleCreative = async (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    
    const file = creativeFiles[index];

    // 1. Validate file existence (It must be a File object to upload)
    if (!file || !(file instanceof File)) {
      triggerNotification('info', 'Please upload a new image before saving.');
      return;
    }

    // 2. Validate Edit Mode
    if (!selectedPost) {
      triggerNotification('error', 'No post selected. Please save the post first.');
      return;
    }

    // 3. Find specific Creative ID
    const creativeEntry = selectedPost.creatives[index];
    if (!creativeEntry || !creativeEntry.id) {
      triggerNotification('error', 'Creative ID not found. Use "Edit and Update" to add new creative slots.');
      return;
    }

    try {
      // 4. Show Loader
      setIsSubmitting(true);

      const response = await updateCreativeImage(creativeEntry.id, file);

      // 5. Hide Loader
      setIsSubmitting(false);

      if (response.success) {
        // A. Update local selectedPost state (Model)
        const updatedCreatives = [...selectedPost.creatives];
        updatedCreatives[index] = response.data; // The API returns the updated creative object
        setSelectedPost({
          ...selectedPost,
          creatives: updatedCreatives
        });

        // B. Update the UI Visuals immediately
        // Replace the local File object with the new URL from the server
        const newFiles = [...creativeFiles];
        newFiles[index] = response.data.creative_url; 
        setCreativeFiles(newFiles);

        // C. Refresh background calendar data
        fetchPostsForMonth(selectedYear, selectedMonth);

        // D. Show Success Notification
        triggerNotification('success', response.message || 'Creative updated successfully.');

      } else {
        triggerNotification('error', 'Update failed: ' + response.message);
      }
     
    } catch (error: any) {
      // Hide Loader on error
      setIsSubmitting(false);
      console.error('Save creative error:', error);
      triggerNotification('error', 'Error updating creative: ' + (error.message || 'Server Error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      triggerNotification('error', 'Please enter a title.');
      return;
    }
    
    // Check if at least one file is uploaded
    if (creativeFiles.every(f => f === null)) {
      triggerNotification('error', 'Please upload at least one photo.');
      return;
    }

    if (captions.some((c) => !c.trim())) {
      triggerNotification('error', 'Please fill all the captions.');
      return;
    }

    // Start Loading (Full Screen)
    setIsSubmitting(true);

    try {
      if (selectedPost) {
        // Update existing post
        const updatedCaptions = selectedPost.captions.map((caption, index) => ({
          id: caption.id,
          caption_text: captions[index],
        }));

        const updateData = {
          name: title,
          captions: updatedCaptions,
        };

        const response = await updatePost(selectedPost.id, updateData);

        if (response.success) {
          triggerNotification('success', response.message);
          fetchPostsForMonth(selectedYear, selectedMonth); 
          resetForm();
        } else {
          triggerNotification('error', 'Update failed: ' + response.message);
        }
      } else {
        // Create a new post
        if (creativeFiles.some(f => f === null)) {
           triggerNotification('error', 'Please upload an image for every slot.');
           setIsSubmitting(false); 
           return;
        }

        const response = await uploadPostWithCreatives(
          title,
          publishDate,
          captions,
          state,
          creativeFiles as File[] 
        );

        if (response.success) {
          triggerNotification('success', response.message);
          fetchPostsForMonth(selectedYear, selectedMonth); 
          resetForm();
        } else {
          triggerNotification('error', 'Upload failed: ' + response.message);
        }
      }
     
    } catch (error: any) {
      triggerNotification('error', 'Error: ' + error.message);
    } finally {
      // Stop Loading
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation(); // Prevent opening the edit form
    setPostToDelete(postId);
    setDeleteConfirmed(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      // Using the dynamic, authenticated API from api.ts
      const response = await deletePost(postToDelete);

      if (response.success) {
        // Close the confirmation modal first
        setShowDeleteModal(false);
        // Refresh data
        fetchPostsForMonth(selectedYear, selectedMonth);
        // Show Success Popup
        triggerNotification('success', response.message || 'Post and associated data deleted successfully.');
      } else {
        triggerNotification('error', 'Failed to delete post: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      triggerNotification('error', 'Error deleting post: ' + (error.message || 'Server error'));
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const handleSaveDraft = () => {
    triggerNotification('info', 'Save as Draft clicked - no API integration yet.');
  };

  const tabs = [
    { id: 'script', label: 'Script Library', icon: 'ri-file-text-line' },
    { id: 'calendar', label: 'Monthly Calendar', icon: 'ri-calendar-line' },
    { id: 'engagement', label: 'Engagement Library', icon: 'ri-heart-line' },
  ];

  const handlePostSelect = async (post: CalendarEntry) => {
    setSelectedPost(post);
    setTitle(post.name);
    setState(post.state);
    setLanguage(post.language || '');
    setPoliticalParty(post.party || '');
    setCaptions(post.captions.map((c) => c.caption));
    setPublishDate(`${post.year}-${String(post.month).padStart(2, '0')}-${String(post.day).padStart(2, '0')}`);
    setShowForm(true);
    setCalendarDate(new Date(post.year, post.month - 1, post.day));

    // Fetch each creative individually and map to the correct slot
    const newFiles = Array(MAX_CREATIVES).fill(null);
    
    if (post.creatives && post.creatives.length > 0) {
      const filePromises = post.creatives.map(async (creative, index) => {
        if (index < MAX_CREATIVES) {
          try {
            const response = await fetch(creative.creative_url);
            const blob = await response.blob();
            // Create a file object from the blob
            return { index, file: new File([blob], `image-${index}.jpg`, { type: blob.type }) };
          } catch (error) {
            console.error(`Error fetching image ${index}:`, error);
            return null;
          }
        }
        return null;
      });

      const results = await Promise.all(filePromises);
      
      results.forEach(result => {
        if (result) {
          newFiles[result.index] = result.file;
        }
      });
      
      setCreativeFiles(newFiles);
    } else {
      setCreativeFiles(Array(MAX_CREATIVES).fill(null));
    }
  };

  const handleCalendarChange = (date: Date) => {
    setCalendarDate(date);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setPublishDate(formattedDate);
    setShowForm(true);

    setSelectedPost(null);
    setTitle('');
    setState('');
    setLanguage('');
    setPoliticalParty('');
    setCaptions(Array(MAX_CREATIVES).fill(''));
    // Reset array
    setCreativeFiles(Array(MAX_CREATIVES).fill(null));
  };

  const [currentDate] = useState(new Date());
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEntriesForDate = (date: Date | null): CalendarEntry[] => {
    if (!date) return [];
    return calendarEntries.filter(entry => entry.day === date.getDate() && entry.month === date.getMonth() + 1 && entry.year === date.getFullYear());
  };

  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  const fetchPostsForMonth = async (year: number, month: number) => {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const response = await getPostsByDateRange(
        startDate.getDate(),
        startDate.getMonth() + 1,
        startDate.getFullYear(),
        endDate.getDate(),
        endDate.getMonth() + 1,
        endDate.getFullYear()
      );

      if (response.success && Array.isArray(response.data)) {
        setCalendarEntries(response.data as CalendarEntry[]);
      } else {
        console.error('Failed to fetch posts:', response.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPostsForMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const resetForm = () => {
    setTitle('');
    setState('');
    setLanguage('');
    setPublishDate('');
    // Reset array
    setCreativeFiles(Array(MAX_CREATIVES).fill(null));
    setCaptions(Array(MAX_CREATIVES).fill(''));
    setPoliticalParty('');
    setShowForm(false);
    setSelectedPost(null);
    setIsSubmitting(false);
  };


  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'} min-h-screen p-8 font-sans relative`}>
      
      {/* --- Full Screen Loader Overlay (Submitting) --- */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-700 font-medium">Submitting Content...</p>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Confirm Deletion</h3>
            
            <div className="flex items-center mb-6">
              <input 
                type="checkbox" 
                id="confirmDeleteCheckbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="confirmDeleteCheckbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 select-none">
                Are you sure to delete the post
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!deleteConfirmed || isDeleting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2
                  ${deleteConfirmed && !isDeleting 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-300 cursor-not-allowed'
                  }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Centralized Notification Modal (Beautiful UI) --- */}
      {notification.show && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 animate-fade-in-up">
            
            {/* Dynamic Icon based on type */}
            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 
              ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 
                notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 
                'bg-blue-100 dark:bg-blue-900/30'}`}>
              
              {notification.type === 'success' && (
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              
              {notification.type === 'error' && (
                <svg className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}

              {notification.type === 'info' && (
                <svg className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
              {notification.type === 'success' ? 'Success!' : notification.type === 'error' ? 'Error' : 'Notice'}
            </h3>
            
            <p className="text-gray-500 dark:text-gray-300 mb-8 leading-relaxed">
              {notification.message}
            </p>
            
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2
                ${notification.type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                  notification.type === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <nav className="bg-white border-b mb-4">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowForm(false);
                }}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <i className={`${tab.icon} w-4 h-4 flex items-center justify-center`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Dgin App Admin Panel</h1>
      </header>

      {activeTab === 'calendar' && !showForm ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Social Media Calendar</h2>
              <p className="text-gray-600">Upload and manage monthly social media plans, creatives, and content.</p>
            </div>

             {/* Year and Month Selection */}
             <div className="flex items-center justify-between mb-6">
              <div>
                <label className="mr-2">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border rounded p-1"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mr-2">Select Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border rounded p-1"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h3>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {weekDays.map((day) => (
                <div key={day} className="p-3 text-center font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}

              {getDaysInMonth(new Date(selectedYear, selectedMonth)).map((day, index) => {
                const date = day ? new Date(selectedYear, selectedMonth, day) : null;
                const entries = date ? getEntriesForDate(date) : [];
                
                // Determine popup position based on column index (0=Sun, 6=Sat)
                const isLeftEdge = index % 7 === 0;
                const isRightEdge = index % 7 === 6;
                const popupPositionClass = isLeftEdge 
                  ? 'left-0' 
                  : isRightEdge 
                    ? 'right-0' 
                    : 'left-1/2 -translate-x-1/2';

                return (
                  <div
                    key={index}
                    // Added hover:z-20 so the popup appears over other cells.
                    className={`min-h-24 p-2 border border-gray-200 relative group hover:z-20 ${day ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                    onClick={() => {
                      if (day) {
                        handleCalendarChange(new Date(selectedYear, selectedMonth, day));
                      }
                    }}
                  >
                    {day && (
                      <>
                        <div className="font-medium text-gray-900 mb-1">{day}</div>
                        
                        {entries.length > 0 && (
                          <>
                            {/* Existing Small Tag View in Cell */}
                            <div>
                              {entries.map((entry, i) => (
                                <button
                                  key={i}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1 truncate block w-full text-left"
                                  title={entry.name}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent date selection
                                    handlePostSelect(entry);
                                  }}
                                >
                                  {entry.name}
                                </button>
                              ))}
                            </div>

                            {/* HOVER POPUP - With Delete Button */}
                            <div className={`absolute ${popupPositionClass} top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 
                              opacity-0 invisible transition-all duration-300 ease-in-out transform origin-top scale-95 translate-y-2 delay-500
                              group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-y-0 group-hover:delay-0
                            `}>
                              {/* Popup Header */}
                              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-600 rounded-t-xl flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {day} {monthNames[selectedMonth]}
                                </span>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                  {entries.length} Posts
                                </span>
                              </div>
                              
                              {/* Popup Content List */}
                              <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                <ul className="space-y-1">
                                  {entries.map((entry, i) => (
                                    <li 
                                      key={i} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // Stop bubbling to the date cell
                                        handlePostSelect(entry);
                                      }}
                                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group/item"
                                    >
                                      {/* Left side: Badge + Title */}
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-xs font-bold group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                          {i + 1}
                                        </span>
                                        <span className="text-sm text-gray-700 dark:text-gray-200 font-medium group-hover/item:text-indigo-700 dark:group-hover/item:text-indigo-300 leading-snug break-words">
                                          {entry.name}
                                        </span>
                                      </div>

                                      {/* Right side: Delete Button */}
                                      <button
                                        onClick={(e) => handleDeleteClick(e, entry.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                        title="Delete Post"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'calendar' && showForm ? (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Upload Content */}
          <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
            <h2 className="text-lg font-semibold mb-6">Upload Content</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium">Select State</label>
                <select
                  className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} w-full rounded border border-gray-300 px-3 py-2`}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a state
                  </option>
                  <option>Andhra Pradesh</option>
                  <option>Arunachal Pradesh</option>
                  <option>Assam</option>
                  <option>Bihar</option>
                  <option>Chhattisgarh</option>
                  <option>Goa</option>
                  <option>Gujarat</option>
                  <option>Haryana</option>
                  <option>Himachal Pradesh</option>
                  <option>Jharkhand</option>
                  <option>Karnataka</option>
                  <option>Kerala</option>
                  <option>Madhya Pradesh</option>
                  <option>Maharashtra</option>
                  <option>Manipur</option>
                  <option>Meghalaya</option>
                  <option>Mizoram</option>
                  <option>Nagaland</option>
                  <option>Odisha</option>
                  <option>Punjab</option>
                  <option>Rajasthan</option>
                  <option>Sikkim</option>
                  <option>Tamil Nadu</option>
                  <option>Telangana</option>
                  <option>Tripura</option>
                  <option>Uttar Pradesh</option>
                  <option>Uttarakhand</option>
                  <option>West Bengal</option>
                  <option>Delhi</option>
                  <option>Jammu and Kashmir</option>
                  <option>Ladakh</option>
                  <option>Puducherry</option>
                  <option>Chandigarh</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">Select Language</label>
                <select
                  className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} w-full rounded border border-gray-300 px-3 py-2`}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a language
                  </option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Assamese</option>
                  <option>Bengali</option>
                  <option>Gujarati</option>
                  <option>Kannada</option>
                  <option>Malayalam</option>
                  <option>Marathi</option>
                  <option>Odia</option>
                  <option>Punjabi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Urdu</option>
                </select>
              </div>
              {/* Political Party Dropdown */}
              <div>
                <label className="block mb-2 font-medium">Select Political Party</label>
                <select
                  className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} w-full rounded border border-gray-300 px-3 py-2`}
                  value={politicalParty}
                  onChange={(e) => setPoliticalParty(e.target.value)}
                >
                  <option value="" disabled>
                    Choose a party
                  </option>
                  <option>All Party</option>
                  <option>BJP</option>
                  <option>Congress</option>
                  <option>AAP</option>
                  <option>Regional Party</option>
                </select>
              </div>
            </div>

            {/* Publish Date (Read-Only) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="publishDate" className="block mb-2 font-medium">
                  Publish Date
                </label>
                <input
                  id="publishDate"
                  type="date"
                  value={publishDate}
                  readOnly
                  className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 cursor-not-allowed'} w-full rounded border border-gray-300 px-3 py-2`}
                />
              </div>
              <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter content title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} w-full rounded border border-gray-300 px-3 py-2`}
                />
              </div>
            </div>
          </section>

          {/* Upload Creatives */}
          <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow`}>
            <h2 className="text-lg font-semibold mb-4">Upload Creatives</h2>
            {/* Text updated to reflect separate uploads */}
            <p className="text-sm mb-6">Upload a distinct image for each creative slot. Enter each caption separately.</p>

            {Array(MAX_CREATIVES)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} border rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4`}
                >
                  {/* Container for Image + Upload Trigger */}
                  <div 
                    className={`flex-1 border-dashed border-2 rounded flex flex-col items-center justify-center p-4 relative ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    style={{ minWidth: 180, minHeight: 180 }}
                  >
                    {/* The Input - always present but hidden */}
                    <input
                      id={`creativeUpload-${i}`}
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileChange(i, e.target.files[0]);
                        }
                      }}
                    />

                    {creativeFiles[i] ? (
                      <div className="flex flex-col items-center w-full h-full justify-center">
                        {/* Logic: If existing post (edit mode), show separate button. If new post, image is the trigger. */}
                        {selectedPost ? (
                          <>
                            <img
                              src={creativeFiles[i] instanceof File ? URL.createObjectURL(creativeFiles[i] as File) : (creativeFiles[i] as unknown as string)}
                              alt={`Creative ${i + 1}`}
                              className="max-h-32 object-contain rounded shadow-sm mb-3"
                            />
                            
                            {/* Button Container */}
                            <div className="flex items-center gap-2">
                              {/* Re-upload Button (Only for existing posts) */}
                              <label 
                                htmlFor={`creativeUpload-${i}`}
                                className="cursor-pointer bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Re-upload
                              </label>

                              {/* Save Button (To the right of Re-upload) */}
                              <button
                                type="button"
                                onClick={(e) => handleSaveSingleCreative(e, i)}
                                className="cursor-pointer bg-indigo-600 border border-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          // New Post: Image wrapped in label acts as trigger (No extra button)
                          <label htmlFor={`creativeUpload-${i}`} className="cursor-pointer w-full h-full flex items-center justify-center relative group">
                             <img
                              src={creativeFiles[i] instanceof File ? URL.createObjectURL(creativeFiles[i] as File) : (creativeFiles[i] as unknown as string)}
                              alt={`Creative ${i + 1}`}
                              className="max-h-40 object-contain rounded shadow-sm group-hover:opacity-90 transition-opacity"
                            />
                            {/* Optional: subtle hover indication */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">Change</span>
                            </div>
                          </label>
                        )}
                      </div>
                    ) : (
                      /* Empty State - acts as trigger */
                      <label 
                        htmlFor={`creativeUpload-${i}`}
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-gray-500 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12"
                          />
                        </svg>
                        <span>Upload Image {i + 1}</span>
                        <span className="text-xs mt-1">JPG or PNG format</span>
                      </label>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="font-medium mb-2">{`Caption ${i + 1}`}</label>
                    <textarea
                      maxLength={500}
                      placeholder={`Enter caption for creative ${i + 1}`}
                      value={captions[i]}
                      onChange={(e) => handleCaptionChange(i, e.target.value)}
                      className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white'} border rounded p-3 resize-none flex-grow`}
                    />
                    <div className="text-xs text-gray-400 text-right mt-1">{`${captions[i].length} / 500`}</div>
                  </div>
                </div>
              ))}
          </section>

          {/* Action buttons */}
          <div className="max-w-4xl mx-auto flex justify-end gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className={`bg-gray-300 text-gray-700 rounded px-5 py-2 hover:bg-gray-400 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-indigo-600 text-white rounded px-5 py-2 hover:bg-indigo-700 transition flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {selectedPost ? 'Edit and Update' : 'Submit for Review'}
            </button>
          </div>
        </form>
      ) : activeTab === 'script' ? (
        <ScriptLibrary />
      ) : (
        <EngagementLibrary />
      )}
    </div>
  );
};

export default Overview;