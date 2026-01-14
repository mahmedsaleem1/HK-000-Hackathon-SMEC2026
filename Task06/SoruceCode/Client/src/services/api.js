const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const uploadFile = async (file, roomId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
    });

    return response.json();
};

export const downloadFile = (filename) => {
    window.open(`${API_URL}/api/files/download/${filename}`, '_blank');
};

export const getRoomFiles = async (roomId) => {
    const response = await fetch(`${API_URL}/api/files/room/${roomId}`);
    return response.json();
};
