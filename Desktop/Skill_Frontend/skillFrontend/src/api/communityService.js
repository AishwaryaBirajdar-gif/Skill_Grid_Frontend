import axiosInstance from './axiosInstance';

// 1. Create a new community barter circle
export const createCommunityBarter = async (title, description, creatorId) => {
    const response = await axiosInstance.post('/community-barter/create', {
        title,
        description,
        creatorId
    });
    return response.data;
};

// 2. Join an existing community barter circle
export const joinCommunityBarter = async (barterId, userId) => {
    const response = await axiosInstance.post('/community-barter/join', {
        barterId,
        userId
    });
    return response.data;
};

// 3. Fetch all active community circles
export const getAllCommunityCircles = async () => {
    const response = await axiosInstance.get('/community-barter/all');
    return response.data;
};

// ✅ NEW: Fetch closed multi-directional graph loops discovered by the backend engine
export const detectCommunityLoops = async () => {
    const response = await axiosInstance.get('/community-barter/detect-loops');
    return response.data;
};