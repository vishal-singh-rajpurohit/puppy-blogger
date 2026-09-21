import { AuthSessionUnion } from "@/types/authSession.types";
import axios from "axios"
import { Session } from "next-auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("BACKEND URL not found")
}

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
});

export async function getAPICall<T>(uri: string, token: Session & AuthSessionUnion): Promise<T | []> {
    try {
        const response = await apiClient.get<T>(uri, {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${token.access_token}`
            },
        });

        if (response.status >= 400) {
            return [];
        }

        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export async function postAPICall<T, R>(uri: string, body: R, token: Session & AuthSessionUnion): Promise<any> {
    try {
        const response = await apiClient.post<T>(uri, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${token.access_token}`
            },
        });
        console.log(response)
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        // throw error;
    }
}

export async function putAPICall<T, R>(uri: string, body: R, token: Session & AuthSessionUnion): Promise<any> {
    try {
        const response = await apiClient.put<T>(uri, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${token.access_token}`
            },
        });
        console.log(response)
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        // throw error;
    }
}


export default {
    apiClient
}