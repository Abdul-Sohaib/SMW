/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { getAllUsersByStatus, verifyUser, getUserById } from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes, faUser, faPhone, faUserShield, faLink } from "@fortawesome/free-solid-svg-icons";

interface User {
    id: number;
    name: string;
    phoneNumber: string;
    role: string;
    is_verified: boolean;
    createdAt: string;
    updatedAt: string;
    smw?: any[];
    age?: number;
    gender?: string;
}

interface UserDetailsModalProps {
    user: User;
    onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    const relevantSMWData = user.smw && user.smw.length > 0 ? user.smw[0] : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">User Information</h2>
                    <p className="text-sm text-gray-500">Detailed profile of the user</p>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                    <div><FontAwesomeIcon icon={faUser} className="mr-2 text-gray-600" /><strong>Name:</strong> {user.name}</div>
                    <div><FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-600" /><strong>Phone:</strong> {user.phoneNumber}</div>
                    {user.age !== undefined && <div><strong>Age:</strong> {user.age}</div>}
                    {user.gender && <div><strong>Gender:</strong> {user.gender}</div>}
                    <div><FontAwesomeIcon icon={faUserShield} className="mr-2 text-gray-600" /><strong>Role:</strong> {user.role}</div>

                    {relevantSMWData && (
                        <>
                            {relevantSMWData.experience_level && <div><strong>Experience Level:</strong> {relevantSMWData.experience_level}</div>}
                            {relevantSMWData.reward_points !== undefined && <div><strong>Reward Points:</strong> {relevantSMWData.reward_points}</div>}

                           {/* Show Image if available */}
{/* Show Image if available */}
{relevantSMWData?.img_url && (
    <div className="absolute top-16 right-4 pr-4 pt-4">
        <img
            src={relevantSMWData.img_url}
            alt="User"
            className="w-28 h-28 rounded-md border-2 border-gray-300 shadow-md object-cover"
        />
    </div>
)}


{/* Show Social Links if available */}
{["instagram_link", "facebook_link", "twitter_link", "linkedin_url", "youtube_url", "other_url"].map((field) => {
    const label = field.replace("_", " ").replace("url", "URL").toUpperCase();
    const value = relevantSMWData[field];
    if (!value) return null;
    return (
        <div key={field}>
            <FontAwesomeIcon icon={faLink} className="mr-2 text-blue-500" />
            <strong>{label}:</strong>{" "}
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View
            </a>
        </div>
    );
})}

                        </>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserVerification: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(100);
    const [status, setStatus] = useState(false);
    const [constituencyId, setConstituencyId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserIdAndConstituency = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;

                const decoded = decodeJwt(token);
                const userId = decoded?.userId;
                if (!userId) return;

                const userData = await getUserById(userId);
                if (userData.success && userData.user?.smw?.length > 0) {
                    setConstituencyId(userData.user.smw[0].constituency_id);
                }
            } catch (error) {
                console.error("Token decode or fetch error:", error);
            }
        };

        fetchUserIdAndConstituency();
    }, []);

    useEffect(() => {
        if (constituencyId !== null) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, status, constituencyId]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUsersByStatus(page, pageSize, status, constituencyId!);
            if (response.success && Array.isArray(response.users)) {
                const smwUsers = response.users.filter((u: User) => u.role === "smw");
                setUsers(smwUsers);
            } else {
                setUsers([]);
                setError(response.message || "No users found.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    const decodeJwt = (token: string): any => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("JWT decode error:", error);
            return null;
        }
    };

    const handleVerifyUser = async (userId: number) => {
        try {
            await verifyUser(userId);
            await fetchUsers();
            alert("User verified successfully!");
        } catch (error) {
            console.error("Verify error:", error);
            alert("Verification failed.");
        }
    };

    const handleToggleStatus = () => {
        setUsers([]);
        setPage(1);
        setStatus(prev => !prev);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenUserDetails = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseUserDetails = () => {
        setSelectedUser(null);
    };

    if (loading) return <div className="text-center py-10 text-gray-600">Loading users...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">User Verification (SMW)</h1>
                <button
                    onClick={handleToggleStatus}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow"
                >
                    Show {status ? "Non-Verified" : "Verified"}
                </button>
            </div>

            {users.length === 0 ? (
                <div className="text-center text-gray-500">No users found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className="bg-white rounded-xl shadow p-5 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between min-h-[220px]">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
                                    <div className="flex gap-2 items-center">
                                        {user.is_verified && (
                                            <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">Verified</span>
                                        )}
                                        <button onClick={() => handleOpenUserDetails(user)} className="text-blue-600 hover:text-blue-800">
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600">📱 {user.phoneNumber}</p>
                                <p className="text-sm text-gray-600">👤 Role: {user.role}</p>

                                {user.smw && user.smw.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-700 font-medium">🏅 Points: {user.smw[0].reward_points}</p>
                                )}
                            </div>

                            {!user.is_verified && (
                                <button
                                    onClick={() => handleVerifyUser(user.id)}
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg"
                                >
                                    Verify
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-md font-medium"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
                >
                    Next
                </button>
            </div>

            {selectedUser && <UserDetailsModal user={selectedUser} onClose={handleCloseUserDetails} />}
        </div>
    );
};

export default UserVerification;
