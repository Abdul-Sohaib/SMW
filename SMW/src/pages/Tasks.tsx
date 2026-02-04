/* eslint-disable @typescript-eslint/no-explicit-any */
// Tasks.tsx
import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskProofVerificationModal from '../components/TaskProofVerificationModal';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getAllTasksByCategory, getAllTaskCategories, getUserById } from '../api'; // Import API functions

export interface TaskDetail {
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
    constituency_id: number;
    post_link: string | null;
    createdAt: string;
    updatedAt: string;
    submissions?: any[];
}

interface Category {
    id: number;
    category_name: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

const Tasks: React.FC = () => {
    const nevigate = useNavigate();
    const [activeFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask] = useState<number | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [tasks, setTasks] = useState<TaskDetail[]>([]); // Initialize tasks as empty array
    const [categoryName, setCategoryName] = useState<string | null>(null); // Add state for category name
    const [constituencyId, setConstituencyId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const { categoryId } = useParams<{ categoryId: string }>();
    useAppContext();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customFetch } = useAppContext(); // Get customFetch from context

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
                console.error('Error decoding access token:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchConstituencyId = async () => {
            if (!userId) return;

            try {
                const userData = await getUserById(userId);
                console.log("getUserById",userData);

                if (userData.success && userData.user && userData.user.smw && userData.user.smw.length > 0) {
                    setConstituencyId(userData.user.smw[0].constituency_id);
                } else {
                    console.error('Failed to fetch user data or constituency ID not found');
                    setConstituencyId(null); // Or set a default value
                }
            } catch (error) {
                console.error('Error fetching constituency data:', error);
                setConstituencyId(null); // Or set a default value
            }
        };

        if (userId) {
            fetchConstituencyId();
        }
    }, [userId]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!constituencyId) return;

            try {
                const data = await getAllTasksByCategory(categoryId || '', constituencyId);

                if (data.success) {
                    setTasks(data.tasks);
                } else {
                    console.error("Failed to fetch tasks:", data.message);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        const fetchCategoryName = async () => {
             try {
                const data = await getAllTaskCategories();
                if (data.success) {
                    const category = data.categories.find((cat:Category) => cat.id === Number(categoryId));
                    setCategoryName(category ? category.category_name : 'Unknown Category');
                } else {
                    console.error("Failed to fetch category:", data.message);
                    setCategoryName('Unknown Category');
                }
            } catch (error) {
                console.error("Error fetching category:", error);
                setCategoryName('Unknown Category');
            }
        };

        if (categoryId && constituencyId) {
            fetchTasks();
            fetchCategoryName();
        }
    }, [categoryId, constituencyId]); // Add customFetch as a dependency

    const selectedTaskData = tasks.find(t => t.id === selectedTask);
    const selectedSubmissionData = selectedTaskData?.submissions?.find(s => s.id === selectedSubmission?.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleVerifySubmission = (submission: any) => {
        setSelectedSubmission(submission);
    };

    const handleTaskCreated = (newTask: TaskDetail) => {
        setTasks([newTask, ...tasks]); // Add the new task to the tasks array
    };

    const handleTaskDelete = (taskId: number) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };
     const handleTaskClick = (taskId: number) => {
        nevigate(`/tasks/${categoryId}/submissions/${taskId}`);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const filteredTasks = activeFilter === 'all'
        ? tasks
        : tasks.filter(task => task.status === activeFilter);

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

    return (
        <div>
            {/* Category Name Display */}
            {categoryName && (
                <h1 className="text-2xl font-semibold mb-4">{categoryName} </h1>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    <button
                        className="btn btn-primary text-sm flex items-center ml-auto"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} className="mr-1.5" />
                        <span>Create Task</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <div key={task.id} onClick={() => handleTaskClick(task.id)}>
                        <TaskCard task={task} onDelete={handleTaskDelete} />
                    </div>
                ))}
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={handleTaskCreated} // Pass the callback function
                categoryId={parseInt(categoryId || "0", 10)}
            />

            {selectedSubmissionData && selectedTaskData && (
                <TaskProofVerificationModal
                    isOpen={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    proof={{
                        id: selectedSubmissionData.id,
                        taskTitle: selectedTaskData.title,
                        platform: selectedTaskData.submission_requirements,
                        deadline: new Date(selectedTaskData.due_date),
                        submittedAt: selectedSubmissionData.submittedAt,
                        imageUrl: selectedSubmissionData.imageUrl,
                        link: selectedSubmissionData.link,
                        notes: selectedSubmissionData.notes,
                        warriorName: selectedSubmissionData.warriorName,
                        warriorVerified: selectedSubmissionData.warriorVerified,
                    }}
                />
            )}
        </div>
    );
};

export default Tasks;