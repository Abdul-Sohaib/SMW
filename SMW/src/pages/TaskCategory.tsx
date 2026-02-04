import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getAllTaskCategories } from '../api'; // Import API functions

interface Category {
    id: number;
    category_name: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    instruction: { [key: string]: string } | null;
    requirements: string | null;
}

const TaskCategory: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
     
    useAppContext();

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const data = await getAllTaskCategories();
                if (data.success) {
                    const filteredCategories = data.categories.filter((category: { category_name: null; }) => category.category_name !== null);
                    setCategories(filteredCategories);
                } else {
                    setError(data.message || 'Failed to fetch categories');
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/tasks/${categoryId}`);
    };

    if (loading) {
        return <div>Loading categories...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Task Categories</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-48"
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{category.category_name}</h2>
                            <p className="text-gray-600 text-sm line-clamp-3">{category.description}</p>
                        </div>
                        <div className="text-right">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block ml-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TaskCategory;