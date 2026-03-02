import { baseApi } from "./baseApi";

const useApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/register",
          method: "POST",
          body: data,
        };
      },
    }),
    registerActivation: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/activate-account",
          method: "POST",
          body: data,
        };
      },
    }),

    loginUser: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/login",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),

    feedback: builder.mutation({
      query: (data) => {
        return {
          url: "/feedback/post-feedback",
          method: "POST",
          body: data,
        };
      },
    }),

    getProfile: builder.query({
      query: () => {
        return {
          url: "/user/profile",
          method: "GET",
        };
      },
      providesTags: ["updateProfile"],
    }),

    forgotPassword: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/forgot-password",
          method: "POST",
          body: data,
        };
      },
    }),

      reSend: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/resend-verification-code",
          method: "POST",
          body: data,
        };
      },
    }),

    verifyEmail: builder.mutation({
      query: ({ data }) => {
        return {
          url: "/auth/verify-email",
          method: "POST",
          body: data,
        };
      },
    }),

    verifyOtp: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/verify-reset-code",
          method: "POST",
          body: data,
        };
      },
    }),

    resetPassword: builder.mutation({
      query: (data) => {
        return {
          url: "/auth/reset-password",
          method: "POST",
          body: data,
        };
      },
    }),

    updateProfile: builder.mutation({
      query: (data) => {
        return {
          url: "/user/update-profile",
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),
    changePassword: builder.mutation({
      query: (data) => {
        return {
          url: "/user/change-password",
          method: "PUT",
          body: data,
        };
      },
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: "/auth/google-login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["updateProfile"],
    }),
    getHostUser: builder.query({
      query: ({ user, page, search }) => {
        return {
          url: `/dashboard/get-all-user?role=${user}&page=${page}&searchTerm=${search}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useRegisterActivationMutation,
  useFeedbackMutation,
  useLoginUserMutation,
  useGetProfileQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetHostUserQuery,
  useVerifyEmailMutation,
  useReSendMutation,
  useGoogleLoginMutation,
} = useApi;
