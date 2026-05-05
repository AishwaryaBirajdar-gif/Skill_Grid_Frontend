import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
    Search,
    User
} from 'lucide-react';

const BrowseSkills = () => {

    const [allSkills, setAllSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userCache, setUserCache] = useState({});

    const [myProfile, setMyProfile] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    // store selected offered skill object
    const [offeredSkill, setOfferedSkill] = useState(null);

    const currentUserId = localStorage.getItem('userId');

    const navigate = useNavigate();

    // ---------------- FETCH MY PROFILE ----------------
    useEffect(() => {

        const fetchMyProfile = async () => {

            try {

                const res = await axiosInstance.get(`/user/${currentUserId}`);

                setMyProfile(res.data);

                // default selected skill
                if (res.data.skillsOffered?.length > 0) {
                    setOfferedSkill(res.data.skillsOffered[0]);
                }

            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        };

        if (currentUserId) {
            fetchMyProfile();
        }

    }, [currentUserId]);

    // ---------------- FETCH ALL SKILLS ----------------
    useEffect(() => {

        const fetchSkills = async () => {

            try {

                const res = await axiosInstance.get(`/skills`);

                // show only OFFERED skills
                const offered = res.data.filter(
                    skill => skill.type === "OFFERED"
                );

                // ❌ REMOVE MY OWN SKILLS
                const otherUsersSkills = offered.filter(
                    skill => skill.userId !== currentUserId
                );

                setAllSkills(otherUsersSkills);
                setFilteredSkills(otherUsersSkills);

                // preload user data
                otherUsersSkills.forEach(skill =>
                    fetchUser(skill.userId)
                );

            } catch (err) {
                console.error("Error fetching skills:", err);
            }
        };

        fetchSkills();

    }, [currentUserId]);

    // ---------------- FETCH USER ----------------
    const fetchUser = async (userId) => {

        if (userCache[userId]) return;

        try {

            const res = await axiosInstance.get(`/user/${userId}`);

            setUserCache(prev => ({
                ...prev,
                [userId]: res.data
            }));

        } catch (err) {
            console.error("User fetch error:", err);
        }
    };

    // ---------------- SEARCH ----------------
    useEffect(() => {

        if (!searchTerm.trim()) {
            setFilteredSkills(allSkills);
            return;
        }

        const lower = searchTerm.toLowerCase();

        const filtered = allSkills.filter(skill =>
            skill.skillName?.toLowerCase().includes(lower) ||
            skill.category?.toLowerCase().includes(lower) ||
            skill.description?.toLowerCase().includes(lower)
        );

        setFilteredSkills(filtered);

    }, [searchTerm, allSkills]);

    // ---------------- OPEN MODAL ----------------
    const openRequestModal = (skill) => {

        setSelectedSkill(skill);
        setShowModal(true);

        if (myProfile?.skillsOffered?.length > 0) {
            setOfferedSkill(myProfile.skillsOffered[0]);
        }
    };

    // ---------------- SEND REQUEST (UPDATED) ----------------
   const sendRequest = async () => {
    if (!selectedSkill || !offeredSkill) {
        alert("Please select a skill to offer in exchange.");
        return;
    }

    const receiverId = selectedSkill.userId;

    const payload = {
        senderId: currentUserId,
        senderName: localStorage.getItem('userName') || "User", 
        receiverId: receiverId,
        receiverName: userCache[receiverId]?.name || "Skill Member", 
        skillRequested: selectedSkill.skillName,
        skillOffered: offeredSkill.skillName,
        status: "PENDING",

        // Negotiation and progress fields
        senderRequirements: [],
        receiverRequirements: [],
        senderProgress: 0,
        receiverProgress: 0,
        senderLocked: false,
        receiverLocked: false,
        senderRequirementsApproved: false,
        receiverRequirementsApproved: false
    };

    try {
        // This will now find the @PostMapping("/send") on the backend
        const response = await axiosInstance.post('/requests/send', payload); 
        
        if (response.status === 200 || response.status === 201) {
            alert("Request sent successfully!");
            setShowModal(false);
            navigate('/my-requests');
        }
    } catch (err) {
        console.error("Submission Error:", err.response?.data || err);
        alert("Failed to send request. Check your network tab.");
    }
};
    // ---------------- UI ----------------
    return (

        <div className="min-h-screen bg-slate-50 p-8">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-4xl font-black mb-6">
                    Browse Skills
                </h1>

                {/* SEARCH */}
                <div className="relative mb-10">

                    <input
                        className="w-full p-5 pl-14 rounded-2xl shadow border"
                        placeholder="Search skills (React, Java, Design...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                </div>

                {/* SKILLS GRID */}
                <div className="grid md:grid-cols-3 gap-6">

                    {filteredSkills.length > 0 ? (

                        filteredSkills.map(skill => {

                            const user = userCache[skill.userId];

                            return (

                                <div
                                    key={skill.id}
                                    className="bg-white p-6 rounded-2xl shadow border"
                                >

                                    {/* USER INFO */}
                                    <div className="flex items-center gap-3 mb-4">

                                        <User />

                                        <div>
                                            <p className="font-bold">
                                                {user?.name || "Loading..."}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {user?.location || "Unknown Location"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* SKILL */}
                                    <h2 className="text-lg font-bold">
                                        {skill.skillName}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-2">
                                        {skill.description}
                                    </p>

                                    {/* BADGES */}
                                    <div className="flex gap-2 mt-3">

                                        {skill.karmaPoints && (
                                            <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                                🪙 {skill.karmaPoints}
                                            </div>
                                        )}

                                        {skill.depthLevel && (
                                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {skill.depthLevel}
                                            </div>
                                        )}

                                    </div>

                                    {/* BUTTON */}
                                    <button
                                        onClick={() => openRequestModal(skill)}
                                        className="mt-4 w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition-all"
                                    >
                                        Send Request
                                    </button>

                                </div>
                            );
                        })

                    ) : (

                        <div className="text-gray-500">
                            No skills found.
                        </div>
                    )}

                </div>
            </div>

            {/* MODAL */}
            {showModal && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-2xl w-[400px]">

                        <h2 className="font-bold text-lg mb-3">
                            Request Skill
                        </h2>

                        <p className="mb-4">
                            Learn:
                            <b> {selectedSkill?.skillName}</b>
                        </p>

                        {/* SELECT OFFERED SKILL */}
                        <select
                            className="w-full border p-2 rounded"
                            value={offeredSkill?.skillName || ""}
                            onChange={(e) => {

                                const selected =
                                    myProfile?.skillsOffered?.find(
                                        s => s.skillName === e.target.value
                                    );

                                setOfferedSkill(selected);
                            }}
                        >

                            {myProfile?.skillsOffered?.map((s, i) => (

                                <option
                                    key={i}
                                    value={s.skillName}
                                >
                                    {s.skillName}
                                </option>

                            ))}

                        </select>

                        {/* SEND BUTTON */}
                        <button
                            onClick={sendRequest}
                            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                        >
                            Send
                        </button>

                        {/* CANCEL BUTTON */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-2 text-gray-500"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
};

export default BrowseSkills;