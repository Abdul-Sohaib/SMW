import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {BASE_URL} from '../api';

interface WarriorCardProps {
    warrior: {
        id: number;
        reward_points: number;
        user_id: number | null;
        instagram_link: string | null;
        facebook_link: string | null;
        twitter_link: string | null;
        constituency_id: number | null; // Make constituency_id nullable
        createdAt: string;
        updatedAt: string;
        user_details: {
            id: number;
            role: string;
            name: string;
            phoneNumber: string;
            is_verified: boolean;
            booth_id: number;
            village_id: number | null;
            createdAt: string;
            updatedAt: string;
        } | null;
    };
    onClick: () => void;
}

const WarriorCard: React.FC<WarriorCardProps> = ({ warrior, onClick }) => {
    const [constituencyName, setConstituencyName] = useState<string | null>(null);
    useAppContext();
    useEffect(() => {
        const fetchConstituencyName = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error('No access token found.');
                return;
            }
            if (warrior.constituency_id) {
                    try {
                        const response = await fetch(`${BASE_URL}/auth/get-all-constituencies`, {
                      headers: {
                        'Authorization': `Bearer ${accessToken}`,
                      },
                    });

                    if (!response.ok) {
                        console.error('Failed to fetch constituencies:', response.status);
                        return;
                    }

                    const data = await response.json();

                    if (data.success && data.constituency) {
                        const constituency = data.constituency.find(
                            (c: { id: number; name: string }) => c.id === warrior.constituency_id
                        );

                        if (constituency) {
                            setConstituencyName(constituency.name);
                        } else {
                            setConstituencyName('Constituency not found');
                        }
                    } else {
                        console.error('Failed to fetch constituencies:', data.message);
                        setConstituencyName('Failed to load');
                    }
                } catch (error) {
                    console.error('Error fetching constituencies:', error);
                    setConstituencyName('Error');
                }
            } else {
                setConstituencyName('No Constituency');
            }
        };

        fetchConstituencyName();
    }, [warrior.constituency_id]);

    if (!warrior.user_details) {
        return null;
    }

    return (
        <div className="card hover:border-blue-100 border border-transparent cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 font-medium">
                            {warrior.user_details.name.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-3">
                        <h3 className="font-medium">{warrior.user_details.name}</h3>
                        <div className="flex items-center mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${warrior.user_details.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {warrior.user_details.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">{warrior.user_details.role}</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal size={16} className="text-gray-500" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Reward Points</span>
                    <span className="font-medium">{warrior.reward_points}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Constituency</span>
                    <span className="font-medium">{constituencyName}</span>
                </div>
            </div>
        </div>
    );
};

export default WarriorCard;