// TaskCard.tsx
import React from 'react';
import { Calendar, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { useAppContext } from '../context/AppContext';
import { deleteTask } from '../api';

interface TaskCardProps {
    task: {
        id: number;
        title: string;
        description: string;
        reward_points: number;
        due_date: string; // Changed to string to match the API response
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
    onDelete: (taskId: number) => void; // Add onDelete prop
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
    useAppContext();
    const formattedDate = new Date(task.due_date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric', // Add year for clarity
    });

    // Helper function to capitalize the first letter of each word
    const capitalize = (str: string) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent card click when delete button is clicked
        try {

            const data = await deleteTask(task.id);

            if (data.success) {
                console.log('Task deleted successfully:', data.deletedTask);
                onDelete(task.id); // Call the onDelete function with the task ID
            } else {
                console.error('Failed to delete task:', data.message);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="card border border-black hover:border-blue-100 relative cursor-pointer"
        
        > {/* Add relative positioning */}
            <div className="flex justify-between items-start">
                <h3 className="font-medium truncate mr-2">{task.title}</h3>
                <button
                    onClick={handleDelete}
                    className="p-1 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Delete Task"  // Added aria-label for accessibility
                >
                    <Trash2 size={16} className="text-red-500" />
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Reward: {task.reward_points} points
                </span>

                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {capitalize(task.submission_requirements)} Required
                </span>

                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Status: {capitalize(task.status)}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={16} className="mr-1" />
                    <span>Due: {formattedDate}</span>
                </div>

                {/* <div className="flex items-center">
                    <span className="text-xs text-gray-700">Created By: {task.created_by}</span>
                </div> */}
            </div>


        </div>
    );
};

export default TaskCard;