import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ExternalLink, ChevronLeft, ChevronRight, CheckCircle, ZoomIn, ZoomOut, Trash } from 'lucide-react';

import { useAppContext } from '../context/AppContext';
import { deleteSubmission, reviewSubmission } from '../api';
import {BASE_URL} from '../api';

interface Image {
    id: number;
    submission_id: number;
    img_url: string;
    desc: null | string;
    is_primary: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TaskDetail {
    id: number;
    title: string;
    description: string;
    reward_points: number;
    due_date: string;
    submission_requirements: string;
    status: string;
    demographic_criteria: {
        district: string;
    };
    created_by: number;
    category_id: number;
    post_link: null;
    createdAt: string;
    updatedAt: string;
    constituency_id: number;
}

interface UserDetails {
    id: number;
    password: string;
    role: string;
    name: string;
    phoneNumber: string;
    is_verified: boolean;
    booth_id: number | null;
    village_id: number | null;
    createdAt: string;
    updatedAt: string;
    verified_by: number | null;
}

interface SmwSubmissions {
    id: number;
    reward_points: number;
    user_id: number;
    instagram_link: string | null;
    facebook_link: string | null;
    twitter_link: string | null;
    constituency_id: number;
    createdAt: string;
    updatedAt: string;
    user_details: UserDetails;
}

interface TaskSubmission {
    id: number;
    task_id: number;
    smw_id: number;
    submission_type: string;
    submission_url: string | null;
    submission_timestamp: string;
    status: 'pending' | 'reviewed' | 'rejected';
    reviewed_by: null | number;
    reviewed_timestamp: null | string;
    rewarded: null | boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    images: Image[];
    task: TaskDetail;
    smw_submissions: SmwSubmissions;
    constituency_id: number;
}

interface TaskSubmissionsProps {
    isOpen: boolean;
    onClose: () => void;
    task: TaskDetail;
}

const TaskSubmissions: React.FC<TaskSubmissionsProps> = ({
    isOpen,
    onClose,
    task,
}) => {
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
    
    // FILTER LOGIC: State to track which filter is currently active (pending, reviewed, or rejected)
    // Default is 'pending' so pending submissions show first when modal opens
    const [activeFilter, setActiveFilter] = useState<'pending' | 'reviewed' | 'rejected'>('pending');
    
    useAppContext();

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('No access token found. Please log in.');
                    return;
                }

                const requestBody = {
                    page: 1,
                    pageSize: 1000,
                    constituency_id: task.constituency_id
                };

                const response = await fetch(`${BASE_URL}/smw/get-submissions-by-taskid/${task.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 500 && errorData.message === "No submissions found for this task") {
                        setSubmissions([]);
                        setError(null);
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }

                const data = await response.json();

                if (data.success) {
                    setSubmissions(data.result.submissions);
                } else {
                    setError(data.message || 'Failed to fetch submissions');
                    console.error("Error fetching submissions:", data.message);
                }
            } catch (err) {
                setError((err as Error).message || 'An unexpected error occurred');
                console.error("Error fetching submissions:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchSubmissions();
        }
    }, [isOpen, task.id, task.constituency_id]);

    if (!isOpen) return null;

    // FILTER LOGIC: Filter submissions based on the active filter
    // This creates a new array containing only submissions that match the selected status
    const filteredSubmissions = submissions.filter(sub => sub.status === activeFilter);

    const getStatusColor = (status: TaskSubmission['status']) => {
        switch (status) {
            case 'reviewed':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'pending':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // FILTER LOGIC: Updated handleSelectAll to work with filtered submissions only
    // This ensures "Select All" only selects submissions visible in the current filter
    const handleSelectAll = () => {
        if (selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
            // If all filtered submissions are selected, deselect all
            setSelectedSubmissions(new Set());
        } else {
            // Select all filtered submissions
            const allFilteredIds = new Set(filteredSubmissions.map(sub => sub.id));
            setSelectedSubmissions(allFilteredIds);
        }
    };

    // FILTER LOGIC: Updated isAllSelected to check against filtered submissions
    const isAllSelected = filteredSubmissions.length > 0 && selectedSubmissions.size === filteredSubmissions.length;

       const handleApprove = async (submissionId: number) => {
        try {
            await reviewSubmission(submissionId, 'reviewed');
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(submission =>
                    submission.id === submissionId ? { ...submission, status: 'reviewed' } : submission
                )
            );
            showNotification("Task is Approved");
        } catch (error) {
            console.error("Error approving submission:", error);
            setError('Failed to approve submission');
            showNotification("Failed to approve task");
        }
    };

    const handleReject = async (submissionId: number) => {
        try {
            await reviewSubmission(submissionId, 'rejected');
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(submission =>
                    submission.id === submissionId ? { ...submission, status: 'rejected' } : submission
                )
            );
            showNotification("Task is Rejected");
        } catch (error) {
            console.error("Error rejecting submission:", error);
            setError('Failed to reject submission');
            showNotification("Failed to reject task");
        }
    };

    const handleDelete = async (submissionId: number) => {
        try {
            const data = await deleteSubmission(submissionId);

            if (data.success) {
                setSubmissions(prevSubmissions =>
                    prevSubmissions.filter(submission => submission.id !== submissionId)
                );
                showNotification("Task has been deleted");
            } else {
                setError(data.message || 'Failed to delete submission');
                console.error('Failed to delete submission:', data.message);
                showNotification("Failed to delete task");
            }
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred while deleting the submission');
            console.error('Error deleting submission:', err);
            showNotification("Failed to delete task");
        }
    };

    const handleToggleSelect = (submissionId: number) => {
        setSelectedSubmissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(submissionId)) {
                newSet.delete(submissionId);
            } else {
                newSet.add(submissionId);
            }
            return newSet;
        });
    };

    const handleApproveSelected = async () => {
        if (selectedSubmissions.size === 0) return;
        
        try {
            const approvalPromises = Array.from(selectedSubmissions).map(id => 
                reviewSubmission(id, 'reviewed')
            );
            
            await Promise.all(approvalPromises);
            
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(submission =>
                    selectedSubmissions.has(submission.id) 
                        ? { ...submission, status: 'reviewed' } 
                        : submission
                )
            );
            
            showNotification(`${selectedSubmissions.size} task(s) approved successfully`);
            setSelectedSubmissions(new Set());
        } catch (error) {
            console.error("Error approving selected submissions:", error);
            showNotification("Failed to approve some tasks");
        }
    };

    const shortenURL = (url: string | null, maxLength: number = 30): string => {
        if (!url) return 'No Link Available';
        return url.length <= maxLength ? url : url.substring(0, maxLength) + '...';
    };

    return (
        <div className={isOpen ? "block" : "hidden"}>
            {/* Notification */}
            {notification && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50 ">
                    {notification}
                </div>
            )}

            <div className="bg-white rounded-2xl mx-4">
                <div className="flex w-full justify-between items-center border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-xl font-medium">{task.title}</h2>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar size={14} className="mr-1" />
                                    <span>Due: {formatDate(task.due_date)}</span>
                                </div>
                                
                                {/* FILTER BUTTONS: Added below the heading as requested */}
                                {/* These buttons allow users to filter submissions by status */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => setActiveFilter('pending')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            activeFilter === 'pending'
                                                ? 'bg-gray-700 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setActiveFilter('reviewed')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            activeFilter === 'reviewed'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Reviewed
                                    </button>
                                    <button
                                        onClick={() => setActiveFilter('rejected')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            activeFilter === 'rejected'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Rejected
                                    </button>
                                </div>
                            </div>
                            
                            {/* FILTER LOGIC: Updated to show count of filtered submissions */}
                            {filteredSubmissions.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isAllSelected
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                                    }`}
                                >
                                    {isAllSelected ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>
                        
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="stats-card">
                            <span className="stats-value text-green-600">
                                {submissions.filter(s => s.status === 'reviewed').length}
                            </span>
                            <span className="stats-label">Reviewed</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-value text-gray-600">
                                {submissions.filter(s => s.status === 'pending').length}
                            </span>
                            <span className="stats-label">Pending</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-value text-red-600">
                                {submissions.filter(s => s.status === 'rejected').length}
                            </span>
                            <span className="stats-label">Rejected</span>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={onClose}
                            className="btn btn-secondary text-sm border-2 border-red-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
                

                <div className=" overflow-y-auto max-h-full mt-10">
                    {loading && <p>Loading submissions...</p>}
                    {/* This ensures only submissions matching the active filter are displayed */}
                    <div className="grid grid-cols-2 w-full justify-center items-center gap-6 overflow-hidden">
                        {filteredSubmissions.map((submission) => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={handleDelete}
                                formatDate={formatDate}
                                shortenURL={shortenURL}
                                getStatusColor={getStatusColor}
                                isSelected={selectedSubmissions.has(submission.id)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}

                        {/* FILTER LOGIC: Updated empty state messages to reflect current filter */}
                        {filteredSubmissions.length === 0 && !loading && !error && (
                            <p>No {activeFilter} submissions found for this task.</p>
                        )}
                        {filteredSubmissions.length === 0 && !loading && error && (
                            <p className="text-Black-500">No {activeFilter} Submission Found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Approve Button */}
            {selectedSubmissions.size > 0 && (
                <div className='fixed bottom-5 right-12 z-50'>
                    <button
                        className="px-12 py-3 text-xl font-bold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg border-2 border-green-800 bg-[#DFF2EF] hover:bg-green-100 text-green-600 shadow-xl"
                        onClick={handleApproveSelected}
                    >
                        Approve Selected ({selectedSubmissions.size})
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskSubmissions;

// Submission Card Component with all details visible
interface SubmissionCardProps {
    submission: TaskSubmission;
    onApprove: (submissionId: number) => Promise<void>;
    onReject: (submissionId: number) => Promise<void>;
    onDelete: (submissionId: number) => Promise<void>;
    formatDate: (dateString: string) => string;
    shortenURL: (url: string | null, maxLength?: number) => string;
    getStatusColor: (status: TaskSubmission['status']) => string;
    isSelected: boolean;
    onToggleSelect: (submissionId: number) => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
    submission,
    onApprove,
    onReject,
    onDelete,
    formatDate,
    shortenURL,
    getStatusColor,
    isSelected,
    onToggleSelect
}) => {
    const [scale, setScale] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const images = submission.images;

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    };

    return (
        <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
            isSelected ? 'border-green-500 shadow-lg' : 'border-black'
        }`}>
          

            {/* Header Section */}
            <div className="p-4 bg-white border-b border-gray-200 flex">
            <div className="flex items-start gap-4 justify-between w-full">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
            <span className="font-medium text-gray-700">
            {submission.smw_submissions.user_details.name.substring(0, 2).toUpperCase()}
            </span>
            </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="font-medium">{submission.smw_submissions.user_details.name}</span>
                                {submission.smw_submissions.user_details.is_verified && (
                                    <CheckCircle size={16} className="text-blue-500 ml-1" />
                                )}
                            </div>
                            
                            <div className='flex justify-center items-center gap-5'>
                                  {/* Selection Checkbox */}
            <div className="flex top-4 left-4 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(submission.id)}
                    className="w-6 h-6 cursor-pointer accent-green-500"
                />
            </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(submission.status)}`}>
                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                                <button
                                    className=" text-sm flex items-center transition-all duration-200 transform hover:scale-105 hover:shadow-md text-[#B91C1C]"
                                    onClick={() => onDelete(submission.id)}
                                >
                                    <Trash className=" w-6" /> 
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                Submitted {formatDate(submission.submission_timestamp)}
                            </span>

                            {submission.submission_type !== "image" && submission.submission_url && (
                                <a
                                    href={submission.submission_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
                                >
                                    View Original <ExternalLink size={14} className="ml-1" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section - Always Visible */}
            <div className="bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4">
                    {/* Left Side: Image Carousel */}
                    <div className="flex flex-col items-center">
                        {images && images.length > 0 ? (
                            <div className="relative w-full">
                                <div
                                    ref={carouselRef}
                                    className="relative rounded-2xl bg-gray-100 shadow-lg overflow-hidden border border-black"
                                >
                                    <div
                                        className="overflow-auto"
                                        style={{
                                            maxHeight: '60vh',
                                            cursor: scale > 1 ? 'grab' : 'default',
                                        }}
                                    >
                                        <div
                                            className="flex transition-transform duration-300 ease-in-out"
                                            style={{
                                                transform: `translateX(-${currentImageIndex * 100}%)`,
                                            }}
                                        >
                                            {images.map((image) => (
                                                <div
                                                    key={image.id}
                                                    className="flex-shrink-0 w-full h-full flex items-center justify-center"
                                                >
                                                    <img
                                                        src={image.img_url}
                                                        alt="Submission preview"
                                                        style={{
                                                            transform: `scale(${scale})`,
                                                            transformOrigin: 'center',
                                                            width: '100%',
                                                            height: 'auto',
                                                            maxHeight: 'none',
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {images.length > 1 && (
                                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between items-center px-4">
                                            <button
                                                onClick={handlePrev}
                                                className="bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow transition-colors duration-200"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                className="bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow transition-colors duration-200"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center mt-4 space-x-3">
                                    <button
                                        onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                                        className="p-3 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        <ZoomOut size={20} />
                                    </button>
                                    <button
                                        onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                                        className="p-3 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        <ZoomIn size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center shadow-md w-full">
                                <p className="text-gray-500">No images provided</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Task Details */}
                    <div className="space-y-3 flex flex-col justify-around h-fit">
                        <div className="flex items-center justify-center">
                            <div className="text-lg font-semibold text-gray-700">Task Details</div>
                            {submission.status === 'reviewed' && (
                                <CheckCircle size={20} className="text-green-500 ml-2" />
                            )}
                        </div>

                        <div className="flex flex-col  p-3 border-b-2 border-black bg-white">
                            <DetailItem label="Task Name" value={submission.task.title} />
                            <DetailItem label="Platform" value={submission.task.submission_requirements} />
                            <DetailItem
                                label="Submitted By"
                                value={submission.smw_submissions.user_details.name}
                                verified={submission.smw_submissions.user_details.is_verified}
                            />
                            <DetailItem label="Deadline" value={formatDate(submission.task.due_date)} />
                            <DetailItem label="Submitted" value={formatDate(submission.submission_timestamp)} />
                            {submission.submission_type !== "image" && (
                                <DetailItem
                                    label="Proof Link"
                                    value={submission.submission_url ? shortenURL(submission.submission_url) : null}
                                    link={submission.submission_url}
                                />
                            )}
                        </div>
                        <div className="flex justify-around w-full gap-1 bg-white">
                            <button
                                className="w-full p-2 text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-green-800 bg-[#DFF2EF] hover:border-green-800 text-[#34D399]"
                                onClick={() => onApprove(submission.id)}
                            >
                                Approve
                            </button>
                            <button
                                className="w-full p-2 text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-md border border-orange-800 bg-[#FEF3C7] hover:border-orange-800 text-[#A16207]"
                                onClick={() => onReject(submission.id)}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Detail Item Component
interface DetailItemProps {
    label: string;
    value: string | null;
    verified?: boolean;
    link?: string | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, verified, link }) => {
    return (
        <div className="py-0.5">
            <strong className="text-gray-700 text-sm">{label}:</strong>
            {value ? (
                <>
                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm ml-1"
                        >
                            {value}
                            <ExternalLink size={14} className="inline-block ml-1 align-text-top" />
                        </a>
                    ) : (
                        <span className="text-gray-600 text-sm ml-1">{value}</span>
                    )}
                    {verified && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Verified
                        </span>
                    )}
                </>
            ) : (
                <span className="text-gray-500 text-sm ml-1">No Link Available</span>
            )}
        </div>
    );
};