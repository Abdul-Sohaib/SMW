/* eslint-disable @typescript-eslint/no-explicit-any */
// CreateTaskModal.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createTask, getAllTaskCategories, uploadTaskImage, uploadTaskVideo } from '../api';
import { getUserById, getAllConstituencies } from '../api';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: (task: any) => void;
    categoryId: number;
}

interface Category {
    id: number;
    category_name: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    instruction: { [key: string]: string } | null;
    requirements: string | null;
}

interface Constituency {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated, categoryId }) => {
    // Initial form state
    const initialFormData = {
        title: '',
        rewardPoints: 0,
        dueDate: '',
        platform: '',
        postLink: '', // Add postLink to form data
        description: '', // Add caption to form data
        instruction: '', // This will hold stringified version only for the create task API call
        submission_requirements: '', // Requirements field renamed
        constituency: '', // Add constituency name to form data (display only)
        constituency_id: 0, // Add constituency ID to form data (for API)
    };

    const [formData, setFormData] = useState(initialFormData);

    const [instructionPoints, setInstructionPoints] = useState<string[]>([]);
    const [, setCategoryDetails] = useState<Category | null>(null);  // State to store category details
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [constituencyName, setConstituencyName] = useState<string>(''); // Display Value
    const [userId, setUserId] = useState<number | null>(null); // User ID

    useAppContext();

    const platformOptions = ['facebook', 'instagram', 'twitter', 'other'];
    const categoryIdNumber = Number(categoryId);

    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    const [taskIdForImageUpload, setTaskIdForImageUpload] = useState<number | null>(null);

    // Determine if image upload modal should be shown based on categoryId
    const shouldShowImageUpload = ![1,2].includes(categoryIdNumber); // Don't show for category 7,8.

    // Fetch category details when categoryId changes
    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                const data = await getAllTaskCategories();

                if (data.success) {
                    const category = data.categories.find((cat: Category) => cat.id === categoryIdNumber);
                    if (category) {
                        setCategoryDetails(category);

                        // Set the instruction points for display as a list
                        setInstructionPoints(category.instruction ? Object.values(category.instruction) : []);
                        // Stringify instructions for passing into API as single text field

                        //set the submission_requirnments
                        setFormData(prevFormData => ({
                            ...prevFormData,
                            instruction: category.instruction ? JSON.stringify(category.instruction) : '',
                            submission_requirements: category.requirements || '', // changed here
                        }));

                    } else {
                        console.log(`Category with ID ${categoryId} not found.`);
                        setSubmitError(`Category with ID ${categoryId} not found.`);
                    }
                } else {
                    console.error("Failed to fetch category:", data.message);
                    setSubmitError(data.message || 'Failed to fetch category details');
                }
            } catch (error) {
                console.error("Error fetching category:", error);
                setSubmitError((error as any).message || 'Error fetching category details');
            }
        };

        if (categoryId) {
            fetchCategoryDetails();
        }
    }, [categoryId]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('No access token found.');
                    return;
                }

                const decodedToken = decodeJwt(accessToken);

                if (decodedToken && decodedToken.userId) {
                    setUserId(decodedToken.userId);
                } else {
                    console.error('User ID not found in access token.');
                }
            } catch (error) {
                console.error('Error decoding JWT:', error);
            }
        };

        fetchUserId();
    }, []);

    // Fetch constituency name based on constituency_id
    useEffect(() => {
        const fetchConstituencyData = async () => {
            if (!userId) return;

            try {
                const userData = await getUserById(userId);

                if (userData.success && userData.user && userData.user.smw && userData.user.smw.length > 0) {
                    const constituencyId = userData.user.smw[0].constituency_id;

                    // Fetch all constituencies to find the name
                    const constituenciesData = await getAllConstituencies();

                    if (constituenciesData.success && constituenciesData.constituency) {
                        const constituency = constituenciesData.constituency.find(
                            (c: Constituency) => c.id === constituencyId
                        );

                        if (constituency) {
                            setConstituencyName(constituency.name); // For display purposes
                            setFormData(prevFormData => ({
                                ...prevFormData,
                                constituency: constituency.name, // Display Name
                                constituency_id: constituency.id, //  For the API.
                            }));
                        } else {
                            console.log(`Constituency with ID ${constituencyId} not found.`);
                            setConstituencyName('Constituency not found');
                            setFormData(prevFormData => ({
                                ...prevFormData,
                                constituency: 'Constituency not found',
                                constituency_id: 0, // Or some default value
                            }));
                        }
                    } else {
                        console.error('Failed to fetch constituencies:', constituenciesData.message);
                        setConstituencyName('Failed to load constituency');
                        setFormData(prevFormData => ({
                            ...prevFormData,
                            constituency: 'Failed to load constituency',
                            constituency_id: 0, // Or some default value
                        }));
                    }
                } else {
                    console.error('Failed to fetch user data or constituency ID not found');
                    setConstituencyName('Failed to load constituency');
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        constituency: 'Failed to load constituency',
                        constituency_id: 0, // Or some default value
                    }));
                }
            } catch (error) {
                console.error('Error fetching constituency data:', error);
                setConstituencyName('Error loading constituency');
                setFormData(prevFormData => ({
                    ...prevFormData,
                    constituency: 'Error loading constituency',
                    constituency_id: 0, // Or some default value
                }));
            }
        };

        if (userId) {
            fetchConstituencyData();
        }
    }, [userId]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'postLink') {
            console.log('Post Link updated:', value); // Check if postLink is captured
        }
    };

    // Reset Form Function
    const resetForm = () => {
        setFormData(initialFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const dueDateISO = new Date(formData.dueDate).toISOString().replace(/\.\d+Z$/, 'Z');

            const taskData = {
                title: formData.title,
                reward_points: parseInt(formData.rewardPoints.toString(), 10),
                due_date: dueDateISO,
                competition_type: "open",
                demographic_criteria: { "district": "Morigaon" },
                category_id: categoryIdNumber,
                platform: formData.platform.toLowerCase(),
                post_link: formData.postLink || null,  // Ensure postLink is included
                description: formData.description || null,   //Ensure caption is included
                instruction: formData.instruction || null,  // Ensure instruction is included
                submission_requirements: formData.submission_requirements || null,  // Ensure requirements is included
                constituency_id: formData.constituency_id, // Include the constituency ID
            };

            console.log('Task Data before submission:', taskData);  // Log the taskData

            const data = await createTask(taskData);

            console.log('API Response:', data); // Log the entire response

            if (data.success) {
                // Create a task object without the post_link property for the TaskCard to display
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { post_link, ...createdTaskWithoutPostLink } = data.createdTask;

                console.log('Task created successfully:', createdTaskWithoutPostLink);
                onTaskCreated(createdTaskWithoutPostLink);

                setTaskIdForImageUpload(data.createdTask.id);

                resetForm();  // Reset the form after successful submission
                setIsSubmitting(false); // Ensure this is set to false BEFORE closing the modal
                if (shouldShowImageUpload) {
                    setIsImageUploadModalOpen(true); // Open the image upload modal only if needed
                } else {
                    onClose(); //Close the modal directly if image upload is not needed
                }

            } else {
                setSubmitError(data.message || 'Failed to create task.');
            }

        } catch (error: any) {
            setSubmitError(error.message || 'An error occurred while creating the task.');
            console.error('Error during task creation:', error); // Log the error
        } finally {
            setIsSubmitting(false); // Ensure this is always set to false after the try/catch block
        }
    };


    const closeImageUploadModal = () => {
        setIsImageUploadModalOpen(false);
        setTaskIdForImageUpload(null);
        onClose();
    };

    // Helper function to decode JWT token
    const decodeJwt = (token: string): any => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-medium">Create New Task</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            className="input"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/*<div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reward Points</label>
                        <input
                            type="number"
                            name="rewardPoints"
                            className="input"
                            value={formData.rewardPoints}
                            onChange={handleInputChange}
                            required
                        />
                    </div>*/}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="datetime-local"
                                name="dueDate"
                                className="input pl-10"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Platform field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select
                            name="platform"
                            className="input"
                            value={formData.platform}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Platform</option>
                            {platformOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    {/* Conditional rendering of Post Link field */}
                    {categoryIdNumber !== 3 && categoryIdNumber !== 4 && ( // Don't show if categoryId is 10
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {categoryIdNumber === 9 ? "Tweet Link" : "Post Link"}
                            </label>
                            <input
                                type="text"
                                name="postLink"
                                className="input"
                                value={formData.postLink}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* Conditionally render caption field */}
                    {![7, 8, 11, 16].includes(categoryIdNumber) && ( // Don't show if categoryId is 7, 8 or 11, 16
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">description</label>
                            <textarea
                                name="description"
                                className="input min-h-[80px]"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {/* Instruction Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                        <ul>
                            {instructionPoints.map((instruction, index) => (
                                <li key={index} className="ml-4 list-disc text-sm text-gray-700">
                                    {instruction}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Requirements Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">submission_requirements</label>
                        <input
                            type="text"
                            name="submission_requirements"
                            className="input"
                            value={formData.submission_requirements}
                            readOnly // Make the field non-editable
                        />
                    </div>

                    {/* Constituency Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                        <input
                            type="text"
                            name="constituency"
                            className="input"
                            value={constituencyName} // Display the name
                            readOnly // Make the field non-editable
                        />
                    </div>

                    {submitError && (
                        <div className="text-red-500">{submitError}</div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-w-[100px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
            {shouldShowImageUpload && isImageUploadModalOpen && taskIdForImageUpload !== null && (
                <ImageUploadModal
                    isOpen={isImageUploadModalOpen}
                    onClose={closeImageUploadModal}
                    taskId={taskIdForImageUpload}
                    categoryId={categoryIdNumber} // Pass categoryId to ImageUploadModal
                />
            )}
        </div>
    );
};

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: number;
    categoryId: number;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, taskId, categoryId }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [uploadedVideoUrls, setUploadedVideoUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // New state to track if any upload has happened
    const [hasUploaded, setHasUploaded] = useState(false);
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
    const [displaySaveMessage, setDisplaySaveMessage] = useState(false);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]); // Only store one selected image at a time
            setSelectedVideo(null);
        }
    };

    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedVideo(event.target.files[0]);
            setSelectedImage(null);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedImage && !selectedVideo) {
            setUploadError('Please select an image or video to upload.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            let uploadData;

            if (selectedImage) {
                const formData = new FormData();
                formData.append('images', selectedImage);  // Correct field name for image
                uploadData = await uploadTaskImage(taskId, formData);

            } else if (selectedVideo) {
                const formData = new FormData();
                formData.append('videos', selectedVideo); // Correct field name for video
                uploadData = await uploadTaskVideo(taskId, formData);
            } else {
                throw new Error('Invalid Submission Type.');
            }
            console.log("uploadData", uploadData)
            if (uploadData && uploadData.success) {
                console.log('File uploaded successfully:', uploadData.images || uploadData.videos);

                if (uploadData.images) {
                    setUploadedImageUrls((prevUrls) => [...prevUrls, ...uploadData.images.map((img: { img_url: string }) => img.img_url)]);
                }

                if (uploadData.videos) {
                    setUploadedVideoUrls((prevUrls) => [...prevUrls, ...uploadData.videos.map((vid: { video_url: string }) => vid.video_url)]);
                }

                setSelectedImage(null); // Clear the selected image
                setSelectedVideo(null); // Clear the selected video
                setUploading(false);
                setUploadError(null);
                setHasUploaded(true); // Set hasUploaded to true after a successful upload
                setUploadSuccessMessage('File uploaded successfully!');  // Show success message
                setTimeout(() => setUploadSuccessMessage(null), 3000);
            } else {
                setUploadError((uploadData && uploadData.message) || 'File upload failed.');
                setUploading(false);
                setUploadError(null);
            }
        } catch (error: any) {
            setUploadError(error.message || 'An error occurred while uploading the file.');
            setUploading(false);
            setUploadError(null);
        }
    };

    const handleSave = () => {
        setDisplaySaveMessage(true);  // Display the save message
        setTimeout(() => {
            setDisplaySaveMessage(false);  // Hide the save message
            onClose();  // Close the modal
        }, 2000); // 2 second delay
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 relative p-6 max-h-[75vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">Upload {[11,5].includes(categoryId) ? 'Images and Videos' : 'Image'}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* Select File Section */}
                {[11,5].includes(categoryId) ? (
                    <>
                        <div className="mb-4">
                            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                Select an Image File
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 w-full py-2 px-3 border border-gray-300 flex items-center justify-center">
                                    <span>Choose an image</span>
                                    <input
                                        id="image-upload"
                                        name="image-upload"
                                        type="file"
                                        className="sr-only" // Hide the default input
                                        accept='image/*'
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, JPEG up to 5MB
                            </p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                Select a Video File
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <label htmlFor="video-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 w-full py-2 px-3 border border-gray-300 flex items-center justify-center">
                                    <span>Choose a video</span>
                                    <input
                                        id="video-upload"
                                        name="video-upload"
                                        type="file"
                                        className="sr-only" // Hide the default input
                                        accept='video/*'
                                        onChange={handleVideoChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                MP4, MOV up to 10MB
                            </p>
                        </div>
                    </>
                ) :
                    (<div className="mb-4">
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                            Select an Image File
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 w-full py-2 px-3 border border-gray-300 flex items-center justify-center">
                                <span>Choose a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only" // Hide the default input
                                    accept='image/*'
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, JPEG up to 5MB
                        </p>
                    </div>)}

                {/* Display selected image */}
                {selectedImage && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Image</label>
                        <img
                            src={selectedImage ? URL.createObjectURL(selectedImage) : ''}
                            alt="Selected"
                            className="w-20 h-20 object-cover rounded"
                        />
                    </div>
                )}
                {selectedVideo && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Video</label>
                        <video width="320" height="240" controls>
                            <source src={selectedVideo ? URL.createObjectURL(selectedVideo) : ''} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {/* Display uploaded files */}
                {(uploadedImageUrls.length > 0 || uploadedVideoUrls.length > 0) && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Files</label>
                        <div className="flex flex-wrap gap-2">
                            {uploadedImageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Uploaded Image ${index}`}
                                    className="w-20 h-20 object-cover rounded"
                                />
                            ))}
                            {uploadedVideoUrls.map((url, index) => (
                                <video key={index} width="160" height="120" controls>
                                    <source src={url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ))}
                        </div>
                    </div>
                )}

                {uploadError && (
                    <div className="text-red-500 mt-2">{uploadError}</div>
                )}

                {/*Display the upload success notification */}
                {uploadSuccessMessage && (
                    <div className="text-green-500 mt-2">{uploadSuccessMessage}</div>
                )}

                {/* Display the save success notification */}
                {displaySaveMessage && (
                    <div className="text-green-500 mt-2">Files saved successfully!</div>
                )}


                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    {hasUploaded && (
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn btn-secondary"
                        >
                            Save
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleFileUpload}
                        className="btn btn-primary"
                        disabled={uploading || (!selectedImage && !selectedVideo)}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;

// Helper function to decode JWT token
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};
