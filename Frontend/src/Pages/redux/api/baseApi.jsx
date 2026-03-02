import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
    prepareHeaders: (headers) => {
        const token = (localStorage.getItem('accessToken'));
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQuery,
    tagTypes: ['overview'],
    endpoints: () => ({})
});


export const imageUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace('/api', '')
