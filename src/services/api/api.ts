import { AxiosError, type AxiosInstance, type AxiosResponse } from "axios";

export interface HttpRequestConfig {
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

export interface StandardBackendResponse<T> {
    status: string;
    message: string;
    data?: T; 
}

interface BaseAPIService {
    get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
    post<T>(url: string, payload?: any, config?: HttpRequestConfig): Promise<T>;
    put<T>(url: string, payload?: any, config?: HttpRequestConfig): Promise<T>;
    patch<T>(url: string, payload?: any, config?: HttpRequestConfig): Promise<T>;
    delete<T>(url: string, payload?: any, config?: HttpRequestConfig): Promise<T>;
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
            return new AppError("Ocorreu um erro interno ou de conexão inesperado.", 500);
        }

        const status = error.response?.status || 500;
        const data = error.response?.data;
        const errorMessage = data?.message || data?.error || "Ocorreu um erro inesperado.";

        switch (status) {
            case 400:
                return new AppError(errorMessage, status, data?.errors);
            case 401:
                return new AppError("Sua sessão expirou ou não está autenticada.", status);
            case 403:
                return new AppError("Você não tem permissão para acessar este recurso.", status);
            case 404:
                return new AppError("Recurso não encontrado.", status);
            case 500:
                return new AppError("O servidor estourou. Parabéns, você quebrou o backend.", status);
            default:
                return new AppError(errorMessage, status);
        }
    }

    async function request<T>(execute: () => Promise<AxiosResponse<StandardBackendResponse<T>>>): Promise<T> {
        try {
            const response = await execute();
            const backendData = response.data;

            return (backendData.data !== undefined) 
                ? backendData.data 
                : (backendData as unknown as T);

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

    async function remove<T>(url: string, data?: any, config?: HttpRequestConfig) {
        return request<T>(() => client.delete(url, { ...config, data }));
    }

    return { 
        get,
        post,
        put,
        patch,
        delete: remove 
    };
}