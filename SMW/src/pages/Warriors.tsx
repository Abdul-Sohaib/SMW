/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import WarriorCard from '../components/WarriorCard';
import WarriorProfile from '../components/WarriorProfile';
import { useAppContext } from '../context/AppContext';
import { getAllSmwAccounts, getUserById } from '../api';
import * as XLSX from 'xlsx';

interface UserDetails {
    id: number;
    password?: string;
    role: string;
    name: string;
    phoneNumber: string;
    is_verified: boolean;
    booth_id: number;
    village_id: number | null;
    createdAt: string;
    updatedAt: string;
}

interface SmwAccount {
    id: number;
    reward_points: number;
    user_id: number | null;
    instagram_link: string | null;
    facebook_link: string | null;
    twitter_link: string | null;
    constituency_id: number | null;
    lat: number | null;
    long: number | null;
    createdAt: string;
    updatedAt: string;
    user_details: UserDetails | null;
}

const Warriors: React.FC = () => {
    const [selectedWarrior, setSelectedWarrior] = useState<number | null>(null);
    const [allWarriors, setAllWarriors] = useState<SmwAccount[]>([]); // Renamed to clarify it holds all data
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [constituencyId, setConstituencyId] = useState<number | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    useAppContext();

    useEffect(() => {
        const fetchConstituencyId = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('No access token found. Please log in.');
                    return;
                }
                const decodedToken = decodeJwt(accessToken);
                const userId = decodedToken?.userId;
                if (!userId) {
                    setError('User ID not found in access token.');
                    return;
                }
                const userData = await getUserById(userId);
                if (userData.success && userData.user && userData.user.smw && userData.user.smw.length > 0) {
                    setConstituencyId(userData.user.smw[0].constituency_id);
                } else {
                    setError('Constituency ID not found for the user.');
                }
            } catch (err: any) {
                setError(err.message || 'Error fetching constituency ID.');
            }
        };
        fetchConstituencyId();
    }, []);

    useEffect(() => {
        const fetchWarriors = async () => {
            setLoading(true);
            setError(null);
            try {
                if (constituencyId === null) return;

                // To sort globally, we fetch a large limit (e.g., 5000) instead of the small page size
                const data = await getAllSmwAccounts(1, 5000, constituencyId);
                if (data.success) {
                    // Filter for SMW role and Sort globally by points immediately
                    const sortedData = ((data as any).smws as SmwAccount[])
                        .filter(w => w.user_details?.role === "smw")
                        .sort((a, b) => (b.reward_points || 0) - (a.reward_points || 0));
                    
                    setAllWarriors(sortedData);
                } else {
                    setError((data as any).message || 'Failed to fetch warriors.');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        if (constituencyId !== null) {
            fetchWarriors();
        }
    }, [constituencyId]); // Removed currentPage dependency so we only fetch once

    // Calculate pagination locally from the sorted allWarriors list
    const totalPages = Math.ceil(allWarriors.length / pageSize);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return allWarriors.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, allWarriors]);

    const handleExport = async () => {
        if (allWarriors.length === 0) return;
        setIsExporting(true);
        try {
            const exportData = allWarriors.map((w) => ({
                "Name": w.user_details?.name || 'N/A',
                "Phone Number": w.user_details?.phoneNumber || 'N/A',
                "Points": w.reward_points || 0,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SMW Leaderboard");
            XLSX.writeFile(workbook, `SMW_Points_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    const selectedWarriorData = allWarriors.find(w => w.id === selectedWarrior);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors bg-blue-50 border-blue-200 text-blue-600">
                            SMW
                        </button>
                        
                        <button 
                            onClick={handleExport}
                            disabled={isExporting || allWarriors.length === 0}
                            className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors bg-green-600 border-green-700 text-white hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
                        >
                            {isExporting ? 'Processing...' : 'Export Excel'}
                        </button>
                    </div>
                </div>
            </div>
            
            {loading && <p>Loading warriors...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTableData.map(warrior => (
                    <div key={warrior.id}>
                        <WarriorCard warrior={warrior} onClick={() => setSelectedWarrior(warrior.id)} />
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {allWarriors.length > 0 && (
                <div className="flex justify-center mt-6 space-x-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="self-center font-medium">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {selectedWarrior && selectedWarriorData && (
                <WarriorProfile
                    warrior={selectedWarriorData}
                    onClose={() => setSelectedWarrior(null)}
                />
            )}
        </div>
    );
};

export default Warriors;

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