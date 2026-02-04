// src/ScriptLibrary.tsx

import React, { useState } from 'react';
import { createScript } from '../api';

interface ScriptData {
  category: string;
  state: string;
  language: string;
  partyName?: string;
  duration: string;
  title: string;
  script: string;
  referenceFile?: File;
}

export default function ScriptLibrary() {
  const [formData, setFormData] = useState<ScriptData>({
    category: '',
    state: '',
    language: '',
    partyName: '',
    duration: '',
    title: '',
    script: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false); // State for error message
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Tourism', 'Infrastructure', 'Politics', 'Education',
    'Geo Politics', 'Unknown Facts', 'Health', 'Technology',
    'Environment', 'Sports', 'Culture', 'Economy'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep'
  ];

  const languages = [
    'English', 'Hindi', 'Assamese', 'Bengali', 'Gujarati', 'Kannada',
    'Malayalam', 'Marathi', 'Odia', 'Punjabi', 'Tamil', 'Telugu', 'Urdu'
  ];

  const parties = ['BJP', 'Congress', 'AAP', 'Regional Party', 'Independent'];

  const durations = ['15 sec', '30 sec', '45 sec', '60 sec', 'Long Format'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowError(false); // Clear any previous error messages

    const scriptData = {
      title: formData.title,
      state: formData.state,
      language: formData.language,
      category: formData.category,
      duration: formData.duration,
      text: formData.script
    };

    try {
      const response = await createScript(scriptData);

      if (response && response.success) {
        console.log('Script submitted successfully:', response);
        setShowSuccess(true);
        setFormData({
          category: '',
          state: '',
          language: '',
          partyName: '',
          duration: '',
          title: '',
          script: ''
        });
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Script submission failed:', response ? response.message : 'Unknown error');
        setShowError(true);
        setErrorMessage(response ? response.message : 'Failed to submit script.');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error submitting script:', error);
      setShowError(true);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFormData({ ...formData, referenceFile: file });
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Script Library</h2>
          <p className="text-gray-600">Upload categorized video or post scripts for multiple industries and political categories.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="ri-check-circle-line w-5 h-5 flex items-center justify-center mr-2"></i>
              Script uploaded successfully!
            </div>
          </div>
        )}

        {showError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line w-5 h-5 flex items-center justify-center mr-2"></i>
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                required
              >
                <option value="">Choose category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                required
              >
                <option value="">Choose state...</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                required
              >
                <option value="">Choose language...</option>
                {languages.map((language) => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            {formData.category === 'Politics' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Party Name *
                </label>
                <select
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                  required
                >
                  <option value="">Choose party...</option>
                  {parties.map((party) => (
                    <option key={party} value={party}>{party}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Duration *
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-8"
                required
              >
                <option value="">Choose duration...</option>
                {durations.map((duration) => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter script title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Script *
            </label>
            <textarea
              value={formData.script}
              onChange={(e) => setFormData({ ...formData, script: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Paste your script content here..."
              required
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Optional Reference File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Accepts PDF, TXT, DOC, or DOCX files</p>
          </div> */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Submit Script'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}