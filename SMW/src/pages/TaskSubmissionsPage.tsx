// pages/TaskSubmissionsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskSubmissions from '../components/TaskSubmissions';
import { getAllTasksByCategory, getUserById } from '../api';

interface TaskDetail {
    id: number;
    title: string;
    description: string;
    reward_points: number;
    due_date: string;
    submission_requirements: string;
    status: string;
    demographic_criteria: { district: string };
    created_by: number;
    category_id: number;
    constituency_id: number;
    post_link: null;
    createdAt: string;
    updatedAt: string;
}

const TaskSubmissionsPage: React.FC = () => {
    const { categoryId, taskId } = useParams<{ categoryId: string; taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [constituencyId, setConstituencyId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    // Fetch user ID
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) return;

                const decodedToken = decodeJwt(accessToken);
                if (decodedToken?.userId) {
                    setUserId(decodedToken.userId);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        };
        fetchUserId();
    }, []);

    // Fetch constituency ID
    useEffect(() => {
        const fetchConstituencyId = async () => {
            if (!userId) return;

            try {
                const userData = await getUserById(userId);
                if (userData.success && userData.user?.smw?.[0]) {
                    setConstituencyId(userData.user.smw[0].constituency_id);
                }
            } catch (error) {
                console.error('Error fetching constituency:', error);
            }
        };

        if (userId) fetchConstituencyId();
    }, [userId]);

    // Fetch task details
    useEffect(() => {
        const fetchTask = async () => {
            if (!constituencyId || !categoryId || !taskId) return;

            try {
                const data = await getAllTasksByCategory(categoryId, constituencyId);
                if (data.success) {
                    const foundTask = data.tasks.find((t: TaskDetail) => t.id === parseInt(taskId));
                    setTask(foundTask || null);
                }
            } catch (error) {
                console.error('Error fetching task:', error);
            } finally {
                setLoading(false);
            }
        };

        if (constituencyId) fetchTask();
    }, [categoryId, taskId, constituencyId]);

    const handleClose = () => {
        navigate(`/tasks/${categoryId}`);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodeJwt = (token: string): any => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!task) {
        return <div className="p-6">Task not found</div>;
    }

    return (
        <div>
            
            <TaskSubmissions
                isOpen={true}
                onClose={handleClose}
                task={task}
            />
        </div>
    );
};

export default TaskSubmissionsPage;