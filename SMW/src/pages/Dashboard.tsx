/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Users, Clipboard, Award } from 'lucide-react';
import { getAdminDashboardCount, getRecentSubmission } from '../api'; // Import API functions

interface DashboardProps {
    customFetch: (url: string, options?: any) => Promise<Response>;
}

interface Submission {
    id: number;
    task_id: number;
    smw_id: number;
    submission_type: string;
    submission_url: string | null;
    submission_timestamp: string;
    status: string;
    reviewed_by: number | null;
    reviewed_timestamp: string | null;
    rewarded: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    task: {
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
        post_link: string | null;
        createdAt: string;
        updatedAt: string;
    };
    images: {
        id: number;
        submission_id: number;
        img_url: string;
        desc: string | null;
        is_primary: boolean;
        createdAt: string;
        updatedAt: string;
    }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Dashboard: React.FC<DashboardProps> = ({ customFetch }) => {
    const [reviewedTasks, setReviewedTasks] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);
    const [completionRate, setCompletionRate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentActivities, setRecentActivities] = useState<Submission[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getAdminDashboardCount();

                if (data.success) {
                    const reviewed = data.result.counts.reviewdTask;
                    const pending = data.result.counts.pendingTask;

                    setReviewedTasks(reviewed);
                    setPendingTasks(pending);

                    const totalTasks = reviewed + pending;
                    const rate = totalTasks > 0 ? (reviewed / totalTasks) * 100 : 0;
                    setCompletionRate(parseFloat(rate.toFixed(2))); // Round to 2 decimal places

                } else {
                    throw new Error(`API Error: ${data.message}`);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        const fetchRecentActivities = async () => {
            setActivityLoading(true);
            setActivityError(null);

            try {
                const data = await getRecentSubmission(1);

                if (data.success) {
                    setRecentActivities(data.submissions.slice(0, 10)); // Display the recent 10 task submissions
                } else {
                    throw new Error(`API Error: ${data.message}`);
                }
            } catch (err: any) {
                setActivityError(err.message || 'Failed to fetch recent activities');
                console.error(err);
            } finally {
                setActivityLoading(false);
            }
        };

        fetchRecentActivities();
    }, []);

    const stats = [
        {
            title: 'Reviewed Tasks',
            value: reviewedTasks,
            icon: Users,
            color: 'blue',
            change: { value: 0, isPositive: true },
        },
        {
            title: 'Pending Tasks',
            value: pendingTasks,
            icon: Clipboard,
            color: 'purple',
            change: { value: 0, isPositive: true },
        },
        {
            title: 'Completion Rate',
            value: `${completionRate}%`,
            icon: Award,
            color: 'green',
            change: { value: 0, isPositive: true },
        },
    ];

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) {
            return `${minutes} min ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    if (loading) {
        return <div>Loading dashboard data...</div>; // Or a more sophisticated loader
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        change={stat.change}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Recent Activity</h2>
                            <button className="text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors">
                                View All
                            </button>
                        </div>

                        {activityLoading ? (
                            <div>Loading recent activity...</div>
                        ) : activityError ? (
                            <div>Error: {activityError}</div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-3">
                                            {activity.smw_id.toString()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-medium">Warrior {activity.smw_id}</span>
                                                <span className="text-gray-500"> submitted task </span>
                                                <span className="font-medium text-gray-800">{activity.task.title}</span>
                                            </p>
                                            <span className="text-xs text-gray-500">{formatTimestamp(activity.submission_timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;