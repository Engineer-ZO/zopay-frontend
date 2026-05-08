import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAccessToken } from '@/features/auth/utils/storage';

/**
 * Specialized API client for file uploads with multipart/form-data
 * 
 * This client is separate from the main apiClient because:
 * 1. File uploads require multipart/form-data content type
 * 2. The browser must set the boundary automatically
 * 3. We need special handling for FormData objects
 */
class FileUploadClient {
    private client: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 60000, // 60 seconds for file uploads
            withCredentials: true, // Include cookies for authentication
        });

        // Request interceptor for authentication
        this.client.interceptors.request.use(
            (config) => {
                // Get token using the same method as main apiClient
                const token = getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // IMPORTANT: Do NOT set Content-Type for FormData
                // Let the browser set it with the correct boundary
                if (config.data instanceof FormData) {
                    delete config.headers['Content-Type'];
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // Server responded with error
                    const message = error.response.data?.message || error.response.data?.error || 'File upload failed';
                    throw new Error(message);
                } else if (error.request) {
                    // Request made but no response
                    throw new Error('No response from server. Please check your connection.');
                } else {
                    // Something else happened
                    throw new Error(error.message || 'An unexpected error occurred');
                }
            }
        );
    }

    /**
     * Upload a file with multipart/form-data
     * 
     * @param url - API endpoint URL
     * @param formData - FormData object containing the file
     * @param config - Additional axios config (optional)
     */
    async upload<T = any>(
        url: string,
        formData: FormData,
        config?: AxiosRequestConfig
    ): Promise<{ data: T }> {
        const response = await this.client.post<T>(url, formData, {
            ...config,
            headers: {
                ...config?.headers,
                // Let browser set Content-Type with boundary
            },
        });

        return { data: response.data };
    }

    /**
     * Upload with progress tracking
     * 
     * @param url - API endpoint URL
     * @param formData - FormData object containing the file
     * @param onProgress - Progress callback function
     */
    async uploadWithProgress<T = any>(
        url: string,
        formData: FormData,
        onProgress?: (progress: number) => void
    ): Promise<{ data: T }> {
        const response = await this.client.post<T>(url, formData, {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });

        return { data: response.data };
    }

    /**
     * Regular GET request (for non-upload endpoints)
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
        const response = await this.client.get<T>(url, config);
        return { data: response.data };
    }

    /**
     * Regular DELETE request
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
        const response = await this.client.delete<T>(url, config);
        return { data: response.data };
    }
}

// Export singleton instance
export const fileUploadClient = new FileUploadClient();
