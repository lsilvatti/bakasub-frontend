import { AxiosError, type AxiosInstance } from "axios";

export interface HttpRequestConfig {
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

interface BaseAPIService {
    get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<T>;
    delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}

export class AppError extends Error {
    public readonly status: number;
    public readonly errors?: any;

    constructor(message: string, status: number, errors?: any) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.errors = errors;
    }
}

export function BaseAPI(client: AxiosInstance): BaseAPIService {

    function handleError(error: unknown): AppError {
        if (!(error instanceof AxiosError)) {
            return new AppError("An unexpected connection or internal error occurred.", 500);
        }

        const status = error.response?.status || 500;
        const data = error.response?.data;

        switch (status) {
            case 400:
                return new AppError(
                    data?.message || "Invalid data. Please check the fields.",
                    status,
                    data?.errors
                );
            case 403:
                return new AppError("You do not have permission to access this resource.", status);
            case 404:
                return new AppError("Resource not found.", status);
            case 500:
                return new AppError("The server encountered an internal error. Please try again later.", status);
            default:
                return new AppError(data?.message || "An unexpected error occurred.", status);
        }
    }

    async function request<T>(execute: () => Promise<{ data: T }>): Promise<T> {
        try {
            const response = await execute();
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    }

    async function get<T>(url: string, config?: HttpRequestConfig) {
        return request<T>(() => client.get(url, config));
    }

    async function post<T>(url: string, data?: any, config?: HttpRequestConfig) {
        return request<T>(() => client.post(url, data, config));
    }

    async function put<T>(url: string, data?: any, config?: HttpRequestConfig) {
        return request<T>(() => client.put(url, data, config));
    }

    async function patch<T>(url: string, data?: any, config?: HttpRequestConfig) {
        return request<T>(() => client.patch(url, data, config));
    }

    async function remove<T>(url: string, config?: HttpRequestConfig) {
        return request<T>(() => client.delete(url, config));
    }

    return { 
        get,
        post,
        put,
        patch,
        delete: remove 
    };
}