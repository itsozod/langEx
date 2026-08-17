import {
  create,
  isAxiosError,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from 'axios';
import { Platform } from 'react-native';

import { useAuthStore } from '@/shared/store/auth-store';

const defaultApiUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiRequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'> & {
  method?: Method;
  body?: unknown;
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function normalizeAxiosError(error: unknown) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Unknown API error');
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const status = axiosError.response?.status ?? 0;
  const body = axiosError.response?.data;
  const message =
    body?.error ??
    body?.message ??
    (status === 0
      ? `Could not reach the API at ${API_URL}. ${axiosError.message}`
      : `Request failed with status ${status}`);

  return new ApiError(message, status, body);
}

function installErrorInterceptor(client: AxiosInstance, handleUnauthorized: boolean) {
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const apiError = normalizeAxiosError(error);
      if (handleUnauthorized && apiError instanceof ApiError && apiError.status === 401) {
        unauthorizedHandler?.();
      }
      return Promise.reject(apiError);
    },
  );
}

export const authApiClient = create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

export const apiClient = create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

installErrorInterceptor(authApiClient, false);
installErrorInterceptor(apiClient, true);

async function request<T>(client: AxiosInstance, path: string, options: ApiRequestOptions = {}) {
  const { body, method = 'GET', ...config } = options;
  const response = await client.request<T>({ ...config, url: path, method, data: body });
  return response.data;
}

export function authApiRequest<T>(path: string, options?: ApiRequestOptions) {
  return request<T>(authApiClient, path, options);
}

export function apiRequest<T>(path: string, options?: ApiRequestOptions) {
  return request<T>(apiClient, path, options);
}
