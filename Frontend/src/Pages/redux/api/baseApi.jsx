import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQuery = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    // 403 = token expired — attempt silent refresh
    if (result?.error?.status === 403) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                const resp = await fetch(`${BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
                if (resp.ok) {
                    const data = await resp.json();
                    localStorage.setItem('accessToken', data.accessToken);
                    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                    // Retry the original request with the new token
                    result = await rawBaseQuery(args, api, extraOptions);
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/auth/login';
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth/login';
            }
        } else {
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
        }
    }

    // 401 = no token / invalid token — redirect only if user was previously logged in
    if (result?.error?.status === 401) {
        const hadToken = !!localStorage.getItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (hadToken) window.location.href = '/auth/login';
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQuery,
    tagTypes: ['overview', 'repairOrders', 'components', 'notifications', 'vendors', 'documents', 'packingLists', 'campgrounds'],
    endpoints: () => ({})
});


export const imageUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace('/api', '')
