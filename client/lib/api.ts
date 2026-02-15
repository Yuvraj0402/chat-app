import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_URL = `${BASE_API_URL}/api`;
export const SOCKET_URL = BASE_API_URL;
/** Base URL for building absolute file URLs (e.g. /api/files/xxx) */
export const BASE_URL = BASE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
});

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});

export const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export interface UploadResult {
    url: string;
    name: string;
    size: number;
    mimeType: string;
}

/** Upload a File to the server (MongoDB GridFS). Returns URL and metadata. */
export async function uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<UploadResult>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { url: data.url, name: data.name, size: data.size, mimeType: data.mimeType };
}

/** Convert data URL to Blob and upload. Used when file was read as data URL (e.g. paste/drag). */
export async function uploadDataUrl(dataUrl: string, name: string, mimeType: string): Promise<UploadResult> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], name, { type: mimeType });
    return uploadFile(file);
}
