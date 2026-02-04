/* eslint-disable @typescript-eslint/no-explicit-any */
// NavBar.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';  // Import LogOut icon
import { getAllConstituencies, getUserById } from '../api'; // Import API functions

interface NavbarProps {
    title: string;
    onLogout: () => void; // Add onLogout prop
    customFetch: (url: string, options?: any) => Promise<Response>;
}

interface UserProfile {
    name: string;
    role: string;
    phoneNumber: string;
    age: number | null;
    gender: string | null;
}

interface Constituency {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

const Navbar: React.FC<NavbarProps> = ({ title, onLogout, customFetch }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [constituencyName, setConstituencyName] = useState<string>('');
    const [userId, setUserId] = useState<number | null>(null); // State to store the user ID

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('No access token found.');
                    return;
                }

                // Decode the JWT to get the user ID
                const decodedToken = decodeJwt(accessToken); // Implement decodeJwt function

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
        const fetchUserProfile = async () => {
            if (!userId) return;

            try {

                const userData = await getUserById(userId);

                if (userData.success && userData.user) {
                    setUserProfile({
                        name: userData.user.name,
                        role: userData.user.role,
                        phoneNumber: userData.user.phoneNumber,
                        age: userData.user.age,
                        gender: userData.user.gender,
                    });

                    // Fetch constituency data
                    if (userData.user.smw && userData.user.smw.length > 0) {
                        const constituencyId = userData.user.smw[0].constituency_id;

                        const constituenciesData = await getAllConstituencies();

                        if (constituenciesData.success && constituenciesData.constituency) {
                            const constituency = constituenciesData.constituency.find(
                                (c: Constituency) => c.id === constituencyId
                            );

                            if (constituency) {
                                setConstituencyName(constituency.name);
                            } else {
                                console.log(`Constituency with ID ${constituencyId} not found.`);
                                setConstituencyName('Constituency not found');
                            }
                        } else {
                            console.error('Failed to fetch constituencies:', constituenciesData.message);
                            setConstituencyName('Failed to load constituency');
                        }
                    } else {
                        console.log('No SMW data found for user.');
                        setConstituencyName('No constituency found');
                    }
                } else {
                    console.error('User profile not found or invalid response:', userData);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, customFetch]); // Add userId and customFetch as dependencies


    const handleSignOut = () => {
        localStorage.removeItem('accessToken');  // Remove access token
        localStorage.removeItem('refreshToken'); // Remove refresh token (if you're using it)
        onLogout(); // Call the onLogout function to update the app state in App.tsx

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

    return (
        <header className="bg-white border-b border-gray-100 h-16 z-10 flex items-center px-6 sticky top-0">
            <h1 className="text-xl font-medium text-gray-900 mr-auto">{title}</h1>

            {/* REMOVED SEARCH BAR */}

            <div className="flex items-center space-x-4">

                {/* REMOVED NOTIFICATION BUTTON */}

                <button
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    onClick={handleSignOut}  // Call handleSignOut
                >
                    <LogOut size={16} className="text-gray-500" />
                    <span className="hidden md:inline text-sm font-medium">Sign Out</span> {/*  Optional text label */}
                </button>

                <div className="relative">
                    <button
                        className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                    </button>

                    {showProfileMenu && userProfile && (  // Make sure userProfile exists
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-20 border border-gray-100">
                            <div className="flex items-center space-x-3 px-4 py-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{userProfile.name}</p>
                                    <p className="text-xs text-gray-500">{userProfile.role}</p>
                                </div>
                            </div>
                            <div className="px-4 py-2">
                                <p className="text-xs text-gray-700">
                                    <span className="font-medium">Phone:</span> {userProfile.phoneNumber}
                                </p>
                                {userProfile.age !== null && (
                                    <p className="text-xs text-gray-700">
                                        <span className="font-medium">Age:</span> {userProfile.age}
                                    </p>
                                )}
                                {userProfile.gender && (
                                    <p className="text-xs text-gray-700">
                                        <span className="font-medium">Gender:</span> {userProfile.gender}
                                    </p>
                                )}
                                {constituencyName && (
                                    <p className="text-xs text-gray-700">
                                        <span className="font-medium">Constituency:</span> {constituencyName}
                                    </p>
                                )}
                            </div>
                            <div className="border-t border-gray-100"></div> {/* Separator */}
                            {/* No more Profile or Sign Out links */}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;