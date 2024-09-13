import axios from 'axios';

const API_URL = 'http://localhost:8850';

export const getUserData = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/current`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch user data.');
    }
};

export const updateUser = async (userData: any) => {
    try {
        const response = await axios.put(`${API_URL}/user/update`, userData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update user data.');
    }
};

export const uploadImage = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(`${API_URL}/user/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });
        return response.data.imageUrl;
    } catch (error) {
        throw new Error('Failed to upload image.');
    }
};
