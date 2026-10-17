import { AuthSessionUnion } from "@/types/authSession.types";
import axios from "axios";
import { Session } from "next-auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("BACKEND URL not found");
}

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

type AuthToken = (Session & AuthSessionUnion) | { access_token?: string } | null | undefined;

function getAuthHeaders(token?: AuthToken) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token?.access_token) {
        headers["Authorization"] = `Bearer ${token.access_token}`;
    }
    return headers;
}

export async function getAPICall<T>(uri: string, token?: AuthToken): Promise<T | []> {
    try {
        const response = await apiClient.get<T>(uri, {
            headers: getAuthHeaders(token),
        });

        if (response.status >= 400) {
            return [];
        }

        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export async function postAPICall<T, R = unknown>(uri: string, body: R, token?: AuthToken): Promise<T | null> {
    try {
        const response = await apiClient.post<T>(uri, body, {
            headers: getAuthHeaders(token),
        });
        return response.data;
    } catch (error: any) {
        console.error("Error posting data:", error);
        if (error.response?.data) {
            return error.response.data as T;
        }
        return null;
    }
}

export async function putAPICall<T, R = unknown>(uri: string, body: R, token?: AuthToken): Promise<T | null> {
    try {
        const response = await apiClient.put<T>(uri, body, {
            headers: getAuthHeaders(token),
        });
        return response.data;
    } catch (error: any) {
        console.error("Error putting data:", error);
        if (error.response?.data) {
            return error.response.data as T;
        }
        return null;
    }
}

export async function deleteAPICall<T>(uri: string, token?: AuthToken): Promise<T | null> {
    try {
        const response = await apiClient.delete<T>(uri, {
            headers: getAuthHeaders(token),
        });
        return response.data;
    } catch (error: any) {
        console.error("Error deleting data:", error);
        if (error.response?.data) {
            return error.response.data as T;
        }
        return null;
    }
}

export default {
    apiClient
}