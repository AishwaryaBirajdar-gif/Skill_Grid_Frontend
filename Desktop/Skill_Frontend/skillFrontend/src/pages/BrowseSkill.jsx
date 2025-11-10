import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Tag, BookOpen, Clock, Loader2, Zap } from 'lucide-react';

// --- Re-using the Mock API Call function with Exponential Backoff ---
const apiCall = async (url, options = {}) => {
    // NOTE: This is a placeholder function. In a real application, 
    // you must handle JWT token inclusion in the Authorization header.
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            if (url.includes('/api/skills')) {
                // Return mock data for GET /api/skills
                resolve(mockSkillsData);
            } else {
                reject(new Error('Mock endpoint not found.'));
            }
        }, 1500);
    });
};

// Mock data structure based on what your SkillController might return
const mockSkillsData = [
    {
        id: 's-101',
        name: 'Conversational Spanish (Intermediate)',
        description: 'Practice speaking with a native speaker focusing on travel vocabulary and real-world scenarios.',
        category: 'Languages',
        listingType: 'OFFERING', // I can teach
        exchangePreferences: 'Seeking equivalent skill exchange in photography or a flat hourly rate.',
        postedBy: { name: 'Maria L.', location: 'Virtual / GMT-5' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 's-102',
        name: 'Introduction to React Hooks',
        description: 'Learn useState, useEffect, and custom hooks to build scalable components.',
        category: 'Technology & IT',
        listingType: 'OFFERING', // I can teach
        exchangePreferences: 'Flexible payment or looking for tutoring in advanced Excel.',
        postedBy: { name: 'Alex J.', location: 'New York, USA' },
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
        id: 's-103',
        name: 'Seeking Piano Lessons (Beginner)',
        description: 'Looking for a teacher who can meet twice a week for basic instruction in classical piano.',
        category: 'Arts & Music',
        listingType: 'SEEKING', // I want to learn
        exchangePreferences: 'Offering graphic design services in return, or a fixed monthly fee.',
        postedBy: { name: 'Chloe T.', location: 'Los Angeles, USA' },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 's-104',
        name: 'Financial Modeling in Python (Pandas)',
        description: 'Advanced one-on-one sessions covering data cleaning and financial forecasting models.',
        category: 'Finance & Business',
        listingType: 'OFFERING',
        exchangePreferences: 'High hourly rate required.',
        postedBy: { name: 'David W.', location: 'London, UK' },
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
];

const SKILL_CATEGORIES = [
    'All Categories',
    'Technology & IT',
    'Languages',
    'Arts & Music',
    'Health & Fitness',
    'Academics & Tutoring',
    'Finance & Business',
    'Handicrafts & DIY',
    'Other'
];

const BrowseSkills = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [filterType, setFilterType] = useState('ALL'); // ALL, OFFERING, SEEKING
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Calling the GET /api/skills endpoint
            // const data = await apiCall('/api/skills');
            
            // --- MOCK FETCH SIMULATION ---
            const data = await apiCall('/api/skills');
            // ---------------------------

            setSkills(data);
        } catch (err) {
            setError('Could not load skill listings. Check the network and backend server status.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Use useMemo to filter skills only when dependencies change
    const filteredSkills = useMemo(() => {
        let filtered = skills;

        // 1. Filter by Listing Type (OFFERING/SEEKING)
        if (filterType !== 'ALL') {
            filtered = filtered.filter(skill => skill.listingType === filterType);
        }

        // 2. Filter by Category
        if (selectedCategory !== 'All Categories') {
            filtered = filtered.filter(skill => skill.category === selectedCategory);
        }

        // 3. Filter by Search Term (Name or Description)
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(skill =>
                skill.name.toLowerCase().includes(lowerSearchTerm) ||
                skill.description.toLowerCase().includes(lowerSearchTerm)
            );
        }

        return filtered;
    }, [skills, searchTerm, selectedCategory, filterType]);

    const handleExchangeRequest = (skillId) => {
        // In a real app, this would navigate the user to the ExchangeForm page
        // which calls POST /api/exchanges (ExchangeController.java)
        alert(`Initiating exchange request for skill ID: ${skillId}. (Not yet implemented)`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Search */}
                <header className="mb-8 bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                        <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
                        Browse the Skill Exchange
                    </h1>
                    <p className="text-gray-600 mb-6">Find skills to learn or opportunities to offer your expertise.</p>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by skill name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            />
                        </div>
                        
                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {SKILL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Type Filter Buttons (Mobile/Desktop friendly) */}
                        <div className="flex space-x-2 md:space-x-3">
                            <FilterButton 
                                label="All" 
                                typeValue="ALL" 
                                currentType={filterType} 
                                setFilterType={setFilterType} 
                            />
                            <FilterButton 
                                label="Offering" 
                                typeValue="OFFERING" 
                                currentType={filterType} 
                                setFilterType={setFilterType} 
                                color="green"
                            />
                            <FilterButton 
                                label="Seeking" 
                                typeValue="SEEKING" 
                                currentType={filterType} 
                                setFilterType={setFilterType} 
                                color="purple"
                            />
                        </div>

                    </div>
                </header>
                
                {/* Content Area */}
                {error && (
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg mb-6">{error}</div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="ml-3 text-lg font-medium text-gray-700">Fetching skills...</p>
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-xl shadow-md">
                        <Zap className="w-10 h-10 mx-auto text-yellow-500" />
                        <h2 className="mt-2 text-xl font-semibold text-gray-900">No Skills Found</h2>
                        <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSkills.map(skill => (
                            <SkillCard 
                                key={skill.id} 
                                skill={skill} 
                                onExchangeRequest={handleExchangeRequest} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable Filter Button Component
const FilterButton = ({ label, typeValue, currentType, setFilterType, color = 'indigo' }) => {
    const isActive = currentType === typeValue;
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition duration-200 border";
    
    let activeClasses = '';
    let inactiveClasses = '';

    if (color === 'green') {
        activeClasses = 'bg-green-600 text-white border-green-700 shadow-md';
        inactiveClasses = 'bg-white text-green-700 border-green-300 hover:bg-green-50';
    } else if (color === 'purple') {
        activeClasses = 'bg-purple-600 text-white border-purple-700 shadow-md';
        inactiveClasses = 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50';
    } else {
        activeClasses = 'bg-indigo-600 text-white border-indigo-700 shadow-md';
        inactiveClasses = 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50';
    }

    return (
        <button
            type="button"
            onClick={() => setFilterType(typeValue)}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} flex-1`}
        >
            {label}
        </button>
    );
};


// Skill Card Component
const SkillCard = ({ skill, onExchangeRequest }) => {
    const isOffering = skill.listingType === 'OFFERING';
    const typeColor = isOffering ? 'bg-green-100 text-green-800 border-green-300' : 'bg-purple-100 text-purple-800 border-purple-300';
    const buttonColor = isOffering ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700';

    const timeSincePost = (dateString) => {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + " years";
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + " months";
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + " days";
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + " hours";
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + " minutes";
        return Math.floor(seconds) + " seconds";
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 pr-4">{skill.name}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${typeColor} whitespace-nowrap`}>
                    {isOffering ? 'Skill Offered' : 'Skill Wanted'}
                </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 flex-grow">{skill.description}</p>
            
            <div className="space-y-2 text-sm text-gray-700 mb-6">
                <p className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Category:</span> {skill.category}
                </p>
                <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Location:</span> {skill.postedBy.location}
                </p>
                <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Posted:</span> {timeSincePost(skill.createdAt)} ago
                </p>
                <p className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium">Exchange:</span> {skill.exchangePreferences}
                </p>
            </div>

            <button
                onClick={() => onExchangeRequest(skill.id)}
                className={`mt-auto w-full py-2.5 rounded-lg text-white font-semibold transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${buttonColor}`}
            >
                {isOffering ? 'Request This Skill' : 'Offer to Teach'}
            </button>
        </div>
    );
};

export default BrowseSkills;