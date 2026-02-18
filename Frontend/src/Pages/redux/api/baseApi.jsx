import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5002/api',
    // http://159.65.217.35:8001
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


export const imageUrl = 'http://localhost:5002'
