import axios from 'axios';

// 강남대학교 도서관 API (Swift 참조: LibraryWebRepositoryImpl.baseURL)
export const BASE_URL = 'https://lib.kangnam.ac.kr';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure interceptors for token management, error handling, etc.
api.interceptors.request.use(
  (config) => {
    // e.g. add token to headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // e.g. handle 401 unauthorized
    return Promise.reject(error);
  }
);
