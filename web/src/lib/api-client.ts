import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse } from "./api-types";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueuedRequest = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let queuedRequests: QueuedRequest[] = [];

const processQueue = (error: unknown | null) => {
  queuedRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  queuedRequests = [];
};

const shouldSkipRefresh = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/verify-email/") ||
  url.includes("/auth/forgot-password") ||
  url.includes("/auth/reset-forgot-password/") ||
  url.includes("/auth/refresh-access-token");

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | RetriableRequestConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve, reject) => {
        queuedRequests.push({ resolve, reject });
      });

      return apiClient(originalRequest);
    }

    isRefreshing = true;

    try {
      await apiClient.post("/auth/refresh-access-token");
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { apiClient };
