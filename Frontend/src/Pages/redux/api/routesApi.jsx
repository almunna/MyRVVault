import { data } from "react-router-dom";
import { baseApi } from "./baseApi";

const routesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   
    addRv: builder.mutation({
      query: (data) => {
        return {
          url: "/rv/add-rv",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),
//fgfdg
    getRv: builder.query({
      query: () => {
        return {
          url: "/rv/get-rvs",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleRv: builder.query({
      query: ({ id }) => {
        return {
          url: `/rv/get-rv/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateRv: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/rv/update-rv/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteRv: builder.mutation({
      query: (id) => {
        return {
          url: `/rv/delete-rv/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["updateProfile"],
    }),

    addChassis: builder.mutation({
      query: (data) => {
        return {
          url: "/chassis/add-chassis",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),

    getChassis: builder.query({
      query: () => {
        return {
          url: "/chassis/get-chassis",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleChassis: builder.query({
      query: ({ id }) => {
        return {
          url: `/chassis/get-chassis/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateChassis: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/chassis/update-chassis/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteChassis: builder.mutation({
      query: (id) => {
        return {
          url: `/chassis/delete-chassis/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

   

    addInsurance: builder.mutation({
      query: (data) => {
        return {
          url: "/insurance-company/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getInsuranceCompany: builder.query({
      query: () => {
        return {
          url: "/insurance-company/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleInsuranceCompany: builder.query({
      query: ({ id }) => {
        return {
          url: `/insurance-company/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateInsuranceCompany: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/insurance-company/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteInsuranceCompany: builder.mutation({
      query: (id) => {
        return {
          url: `/insurance-company/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addTire: builder.mutation({
      query: (data) => {
        return {
          url: "/tire/add-tire",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getTire: builder.query({
      query: () => {
        return {
          url: "/tire/get-tire",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleTire: builder.query({
      query: ({ id }) => {
        return {
          url: `/tire/get-tire/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateTire: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/tire/update-tire/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteTire: builder.mutation({
      query: (id) => {
        return {
          url: `/tire/delete-tire/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addAirCondition: builder.mutation({
      query: (data) => {
        return {
          url: "/air-condition/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getAirCondition: builder.query({
      query: () => {
        return {
          url: "/air-condition/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleAirCondition: builder.query({
      query: ({ id }) => {
        return {
          url: `/air-condition/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateAirCondition: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/air-condition/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteAirCondition: builder.mutation({
      query: (id) => {
        return {
          url: `/air-condition/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addHeater: builder.mutation({
      query: (data) => {
        return {
          url: "/heater/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),
    getHeater: builder.query({
      query: () => {
        return {
          url: "/heater/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleHeater: builder.query({
      query: ({ id }) => {
        return {
          url: `/heater/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateHeater: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/heater/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteHeater: builder.mutation({
      query: (id) => {
        return {
          url: `/heater/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addWaterPump: builder.mutation({
      query: (data) => {
        return {
          url: "/water-pump/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getWaterPump: builder.query({
      query: () => {
        return {
          url: "/water-pump/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleWaterPump: builder.query({
      query: ({ id }) => {
        return {
          url: `/water-pump/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateWaterPump: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/water-pump/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteWaterPump: builder.mutation({
      query: (id) => {
        return {
          url: `/water-pump/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addWasher: builder.mutation({
      query: (data) => {
        return {
          url: "/washer/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getWasher: builder.query({
      query: () => {
        return {
          url: "/washer/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleWasher: builder.query({
      query: ({ id }) => {
        return {
          url: `/washer/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateWasher: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/washer/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteWasher: builder.mutation({
      query: (id) => {
        return {
          url: `/washer/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addWaterHeater: builder.mutation({
      query: (data) => {
        return {
          url: "/water-heater/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getWaterHeater: builder.query({
      query: () => {
        return {
          url: "/water-heater/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleWaterHeater: builder.query({
      query: ({ id }) => {
        return {
          url: `/water-heater/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateWaterHeater: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/water-heater/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteWaterHeater: builder.mutation({
      query: (id) => {
        return {
          url: `/water-heater/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addExpense: builder.mutation({
      query: (data) => {
        return {
          url: "/expense/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getExpense: builder.query({
      query: () => {
        return {
          url: "/expense/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleExpense: builder.query({
      query: ({ id }) => {
        return {
          url: `/expense/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateExpense: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/expense/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteExpense: builder.mutation({
      query: (id) => {
        return {
          url: `/expense/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addToilet: builder.mutation({
      query: (data) => {
        return {
          url: "/toilet/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getToilet: builder.query({
      query: () => {
        return {
          url: "/toilet/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleToilet: builder.query({
      query: ({ id }) => {
        return {
          url: `/toilet/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateToilet: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/toilet/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteToilet: builder.mutation({
      query: (id) => {
        return {
          url: `/toilet/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addTv: builder.mutation({
      query: (data) => {
        return {
          url: "/tv/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getTv: builder.query({
      query: () => {
        return {
          url: "/tv/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleTv: builder.query({
      query: ({ id }) => {
        return {
          url: `/tv/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateTv: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/tv/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteTv: builder.mutation({
      query: (id) => {
        return {
          url: `/tv/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addDriyer: builder.mutation({
      query: (data) => {
        return {
          url: "/dryer/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getDriyer: builder.query({
      query: () => {
        return {
          url: "/dryer/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleDriyer: builder.query({
      query: ({ id }) => {
        return {
          url: `/dryer/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateDriyer: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/dryer/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteDriyer: builder.mutation({
      query: (id) => {
        return {
          url: `/dryer/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addExhaustFans: builder.mutation({
      query: (data) => {
        return {
          url: "/exhaust-fans/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getExhaustFans: builder.query({
      query: () => {
        return {
          url: "/exhaust-fans/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleExhaustFans: builder.query({
      query: ({ id }) => {
        return {
          url: `/exhaust-fans/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateExhaustFans: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/exhaust-fans/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteExhaustFans: builder.mutation({
      query: (id) => {
        return {
          url: `/exhaust-fans/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addVentFans: builder.mutation({
      query: (data) => {
        return {
          url: "/vent-fans/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getVentFans: builder.query({
      query: () => {
        return {
          url: "/vent-fans/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleVentFans: builder.query({
      query: ({ id }) => {
        return {
          url: `/vent-fans/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateVentFans: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/vent-fans/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteVentFans: builder.mutation({
      query: (id) => {
        return {
          url: `/vent-fans/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addDisherInfo: builder.mutation({
      query: (data) => {
        return {
          url: "/dishwasher/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getDisherInfo: builder.query({
      query: () => {
        return {
          url: "/dishwasher/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleDisherInfo: builder.query({
      query: ({ id }) => {
        return {
          url: `/dishwasher/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateDisherInfo: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/dishwasher/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteDisherInfo: builder.mutation({
      query: (id) => {
        return {
          url: `/dishwasher/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addCallingFans: builder.mutation({
      query: (data) => {
        return {
          url: "/celling-fans/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getCallingFans: builder.query({
      query: () => {
        return {
          url: "/celling-fans/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleCallingFans: builder.query({
      query: ({ id }) => {
        return {
          url: `/celling-fans/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateCallingFans: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/celling-fans/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteCallingFans: builder.mutation({
      query: (id) => {
        return {
          url: `/celling-fans/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addDvdInfo: builder.mutation({
      query: (data) => {
        return {
          url: "/dvd/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getDvdInfo: builder.query({
      query: () => {
        return {
          url: "/dvd/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleDvdInfo: builder.query({
      query: ({ id }) => {
        return {
          url: `/dvd/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateDvdInfo: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/dvd/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteDvdInfo: builder.mutation({
      query: (id) => {
        return {
          url: `/dvd/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addGps: builder.mutation({
      query: (data) => {
        return {
          url: "/gps/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getGps: builder.query({
      query: () => {
        return {
          url: "/gps/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleGps: builder.query({
      query: ({ id }) => {
        return {
          url: `/gps/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateGps: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/gps/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteGps: builder.mutation({
      query: (id) => {
        return {
          url: `/gps/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addOutdoor: builder.mutation({
      query: (data) => {
        return {
          url: "/outdoor-radio/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),
    getOutdoor: builder.query({
      query: () => {
        return {
          url: "/outdoor-radio/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleOutdoor: builder.query({
      query: ({ id }) => {
        return {
          url: `/outdoor-radio/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateOutdoor: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/outdoor-radio/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteOutdoor: builder.mutation({
      query: (id) => {
        return {
          url: `/outdoor-radio/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),
    addSurroundSound: builder.mutation({
      query: (data) => {
        return {
          url: "/surround-sound/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getSurroundSound: builder.query({
      query: () => {
        return {
          url: "/surround-sound/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleSurroundSound: builder.query({
      query: ({ id }) => {
        return {
          url: `/surround-sound/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateSurroundSound: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/surround-sound/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteSurroundSound: builder.mutation({
      query: (id) => {
        return {
          url: `/surround-sound/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addInternetSatettling: builder.mutation({
      query: (data) => {
        return {
          url: "/internet-satellite/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getInternetSatettling: builder.query({
      query: () => {
        return {
          url: "/internet-satellite/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleInternetSatettling: builder.query({
      query: ({ id }) => {
        return {
          url: `/internet-satellite/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateInternetSatettling: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/internet-satellite/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteInternetSatettling: builder.mutation({
      query: (id) => {
        return {
          url: `/internet-satellite/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addRouter: builder.mutation({
      query: (data) => {
        return {
          url: "/wifi-router/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getRouter: builder.query({
      query: () => {
        return {
          url: "/wifi-router/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    getSingleRouter: builder.query({
      query: ({ id }) => {
        return {
          url: `/wifi-router/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    updateRouter: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/wifi-router/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteRouter: builder.mutation({
      query: (id) => {
        return {
          url: `/wifi-router/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    addMaintance: builder.mutation({
      query: (data) => {
        return {
          url: "/maintenance-schedule/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getMaintance: builder.query({
      query: () => {
        return {
          url: "/maintenance-schedule/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

     getMaintanceAll: builder.query({
      query: () => {
        return {
          url: "/maintenance-schedule/dashboard",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    getSingleMaintance: builder.query({
      query: ({ id }) => {
        return {
          url: `/maintenance-schedule/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    deleteMaintance: builder.mutation({
      query: (id) => {
        return {
          url: `/maintenance-schedule/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),
  updateMaintance: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/maintenance-schedule/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

  markMaintenanceComplete: builder.mutation({
      query: ({ rvId, maintenanceScheduleId, vendor, cost, date }) => ({
        url: `/maintenance-schedule/update-rv-status/${rvId}`,
        method: "PUT",
        body: { maintenanceScheduleId, vendor, cost, date },
      }),
      invalidatesTags: ["terms"],
    }),
    addMember: builder.mutation({
      query: (data) => {
        return {
          url: "/membership/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),
    getMemberShip: builder.query({
      query: () => {
        return {
          url: "/membership/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
     addSellRv: builder.mutation({
      query: (data) => {
        return {
          url: "/user/sell-rv",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),
    getSellRv: builder.query({
      query: () => {
        return {
          url: "/user/sold-rvs",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleMembership: builder.query({
      query: ({id}) => {
        return {
          url: `/membership/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    updateMemberShip: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/membership/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteMemberShip: builder.mutation({
      query: (id) => {
        return {
          url: `/membership/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),
    addCheckList: builder.mutation({
      query: (data) => {
        return {
          url: "/checklist",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    addBalkItemCheckList: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/checklist/${id}`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),
    getCheckList: builder.query({
      query: () => {
        return {
          url: "/checklist",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

       getSingleCheckList: builder.query({
      query: ({id}) => {
        return {
          url: `/checklist/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    updateCheckList: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/checklist/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteCheckList: builder.mutation({
      query: ({id,data}) => {
        return {
          url: `/checklist/${id}/uncheck-all`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    addRepair: builder.mutation({
      query: (data) => {
        return {
          url: "/new-repair/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getRepair: builder.query({
      query: () => {
        return {
          url: "/new-repair/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleRepair: builder.query({
      query: ({ id }) => {
        return {
          url: `/new-repair/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateRepair: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/new-repair/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteRepair: builder.mutation({
      query: (id) => {
        return {
          url: `/new-repair/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),




addCamp: builder.mutation({
      query: (data) => {
        return {
          url: "/trips",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    getCamp: builder.query({
      query: () => {
        return {
          url: "/trips",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleCamp: builder.query({
      query: ({ id }) => {
        return {
          url: `/trips/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateCamp: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/trips/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteCamp: builder.mutation({
      query: (id) => {
        return {
          url: `/trips/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),


updateSelectRv: builder.mutation({
      query: ( data ) => {
        return {
          url: `/user/select-rv`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),


updateMileago: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/rv/update-mileage/${id}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["updateProfile"],
    }),

    addReports: builder.mutation({
      query: (data) => {
        return {
          url: "/reports/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["terms"],
    }),

    addFavouriteReports: builder.mutation({
      query: (id) => {
        return {
          url: `/reports/toggleFavorite/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    getFavouriteReports: builder.query({
      query: () => {
        return {
          url: "/reports/getFavorite",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),

    getReports: builder.query({
      query: () => {
        return {
          url: "/reports/get",
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    getSingleReports: builder.query({
      query: ({ id }) => {
        return {
          url: `/reports/get/${id}`,
          method: "GET",
        };
      },
      providesTags: ["terms"],
    }),
    updateReports: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/reports/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["terms"],
    }),

    deleteReports: builder.mutation({
      query: (id) => {
        return {
          url: `/reports/delete/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["terms"],
    }),

    // postPrivecy: builder.mutation({
    //     query: (data) => {
    //         return {
    //             url: "/manage/add-privacy-policy",
    //             method: "POST",
    //             body: data,
    //         };
    //     },
    //     invalidatesTags: ["terms"],
    // }),

    // ── Fuel Logs ──────────────────────────────────────────────────────────
    addFuelLog: builder.mutation({
      query: (data) => ({ url: "/fuel/create", method: "POST", body: data }),
      invalidatesTags: ["terms"],
    }),
    getFuelLogs: builder.query({
      query: () => ({ url: "/fuel/get", method: "GET" }),
      providesTags: ["terms"],
    }),
    getFuelStats: builder.query({
      query: () => ({ url: "/fuel/stats", method: "GET" }),
      providesTags: ["terms"],
    }),
    getSingleFuelLog: builder.query({
      query: ({ id }) => ({ url: `/fuel/get/${id}`, method: "GET" }),
      providesTags: ["terms"],
    }),
    updateFuelLog: builder.mutation({
      query: ({ id, data }) => ({ url: `/fuel/update/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["terms"],
    }),
    deleteFuelLog: builder.mutation({
      query: (id) => ({ url: `/fuel/delete/${id}`, method: "POST" }),
      invalidatesTags: ["terms"],
    }),

    // ── Generator Logs ─────────────────────────────────────────────────────
    addGeneratorLog: builder.mutation({
      query: (data) => ({ url: "/generator-log/create", method: "POST", body: data }),
      invalidatesTags: ["terms"],
    }),
    getGeneratorLogs: builder.query({
      query: () => ({ url: "/generator-log/get", method: "GET" }),
      providesTags: ["terms"],
    }),
    getSingleGeneratorLog: builder.query({
      query: ({ id }) => ({ url: `/generator-log/get/${id}`, method: "GET" }),
      providesTags: ["terms"],
    }),
    updateGeneratorLog: builder.mutation({
      query: ({ id, data }) => ({ url: `/generator-log/update/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["terms"],
    }),
    deleteGeneratorLog: builder.mutation({
      query: (id) => ({ url: `/generator-log/delete/${id}`, method: "POST" }),
      invalidatesTags: ["terms"],
    }),

    // ── Repair Orders ──────────────────────────────────────────────────────
    addRepairOrder: builder.mutation({
      query: (formData) => ({ url: "/repair-order/create", method: "POST", body: formData }),
      invalidatesTags: ["repairOrders"],
    }),
    getRepairOrders: builder.query({
      query: () => ({ url: "/repair-order/get", method: "GET" }),
      providesTags: ["repairOrders"],
    }),
    getSingleRepairOrder: builder.query({
      query: ({ id }) => ({ url: `/repair-order/get/${id}`, method: "GET" }),
      providesTags: ["repairOrders"],
    }),
    updateRepairOrder: builder.mutation({
      query: ({ id, formData }) => ({ url: `/repair-order/update/${id}`, method: "PUT", body: formData }),
      invalidatesTags: ["repairOrders"],
    }),
    deleteRepairOrder: builder.mutation({
      query: (id) => ({ url: `/repair-order/delete/${id}`, method: "POST" }),
      invalidatesTags: ["repairOrders"],
    }),
    updateRepairOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({ url: `/repair-order/status/${id}`, method: "PUT", body: { status, note } }),
      invalidatesTags: ["repairOrders"],
    }),

    // ── Smart Suggestions ──────────────────────────────────────────────────
    getSmartSuggestions: builder.query({
      query: () => ({ url: "/smart-suggestions/get", method: "GET" }),
      providesTags: ["terms"],
    }),

    // ── Notifications ──────────────────────────────────────────────────────
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({ url: `/notifications/get?page=${page}&limit=${limit}`, method: "GET" }),
      providesTags: ["notifications"],
    }),
    getNotificationById: builder.query({
      query: (id) => ({ url: `/notifications/${id}`, method: "GET" }),
      providesTags: ["notifications"],
    }),
    getUnreadCount: builder.query({
      query: () => ({ url: "/notifications/unread-count", method: "GET" }),
      providesTags: ["notifications"],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({ url: `/notifications/read/${id}`, method: "PUT" }),
      invalidatesTags: ["notifications"],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({ url: "/notifications/read-all", method: "PUT" }),
      invalidatesTags: ["notifications"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({ url: `/notifications/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["notifications"],
    }),
    clearAllNotifications: builder.mutation({
      query: () => ({ url: "/notifications/clear-all", method: "DELETE" }),
      invalidatesTags: ["notifications"],
    }),
    generateNotifications: builder.mutation({
      query: () => ({ url: "/notifications/generate", method: "POST" }),
      invalidatesTags: ["notifications"],
    }),
    updateNotificationPreferences: builder.mutation({
      query: (prefs) => ({ url: "/user/notification-preferences", method: "PUT", body: prefs }),
      invalidatesTags: ["terms"],
    }),

    // ── Generic Component endpoints (work for ANY appliance collection) ─────
    // query: type key (e.g. "airConditioner") — resolved to URL via COMPONENT_URL_MAP
    getComponents: builder.query({
      query: (urlPath) => ({ url: `/${urlPath}/get`, method: "GET" }),
      providesTags: ["components"],
    }),
    getSingleComponent: builder.query({
      query: ({ urlPath, id }) => ({ url: `/${urlPath}/get/${id}`, method: "GET" }),
      providesTags: ["components"],
    }),
    addComponent: builder.mutation({
      query: ({ urlPath, data }) => ({ url: `/${urlPath}/create`, method: "POST", body: data }),
      invalidatesTags: ["components", "terms"],
    }),
    updateComponent: builder.mutation({
      query: ({ urlPath, id, data }) => ({ url: `/${urlPath}/update/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["components", "terms"],
    }),
    deleteComponent: builder.mutation({
      query: ({ urlPath, id }) => ({ url: `/${urlPath}/delete/${id}`, method: "POST" }),
      invalidatesTags: ["components", "terms"],
    }),
    markComponentReplaced: builder.mutation({
      query: ({ collection, id, data }) => ({
        url: `/component/replace/${collection}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["components", "terms"],
    }),
  }),
});

export const {
  useAddChassisMutation,
  useDeleteChassisMutation,
  useGetChassisQuery,
  useGetSingleChassisQuery,
  useUpdateChassisMutation,
  useAddRvMutation,
  useDeleteRvMutation,
  useGetRvQuery,
  useUpdateRvMutation,
  useGetSingleRvQuery,
  useAddInsuranceMutation,
  useGetSingleInsuranceCompanyQuery,
  useUpdateInsuranceCompanyMutation,
  useDeleteInsuranceCompanyMutation,
  useAddTireMutation,
  useDeleteTireMutation,
  useGetSingleTireQuery,
  useGetTireQuery,
  useUpdateTireMutation,
  useAddAirConditionMutation,
  useDeleteAirConditionMutation,
  useGetAirConditionQuery,
  useGetSingleAirConditionQuery,
  useUpdateAirConditionMutation,
  useAddHeaterMutation,
  useGetHeaterQuery,
  useGetSingleHeaterQuery,
  useUpdateHeaterMutation,
  useDeleteHeaterMutation,
  useAddWaterPumpMutation,
  useDeleteWaterPumpMutation,
  useGetSingleWaterPumpQuery,
  useGetWaterPumpQuery,
  useUpdateWaterPumpMutation,
  useAddWasherMutation,
  useGetWasherQuery,
  useDeleteWasherMutation,
  useGetSingleWasherQuery,
  useUpdateWasherMutation,
  useAddWaterHeaterMutation,
  useGetWaterHeaterQuery,
  useGetSingleWaterHeaterQuery,
  useUpdateWaterHeaterMutation,
  useDeleteWaterHeaterMutation,
  useAddToiletMutation,
  useDeleteToiletMutation,
  useGetSingleToiletQuery,
  useGetToiletQuery,
  useUpdateToiletMutation,
  useAddTvMutation,
  useDeleteTvMutation,
  useGetSingleTvQuery,
  useGetTvQuery,
  useUpdateTvMutation,
  useAddDriyerMutation,
  useDeleteDriyerMutation,
  useGetDriyerQuery,
  useGetSingleDriyerQuery,
  useUpdateDriyerMutation,
  useAddExhaustFansMutation,
  useDeleteExhaustFansMutation,
  useGetExhaustFansQuery,
  useGetSingleExhaustFansQuery,
  useUpdateExhaustFansMutation,
  useAddVentFansMutation,
  useDeleteVentFansMutation,
  useGetVentFansQuery,
  useGetSingleVentFansQuery,
  useUpdateVentFansMutation,
  useAddDisherInfoMutation,
  useDeleteDisherInfoMutation,
  useGetDisherInfoQuery,
  useGetSingleDisherInfoQuery,
  useUpdateDisherInfoMutation,
  useAddCallingFansMutation,
  useGetCallingFansQuery,
  useGetSingleCallingFansQuery,
  useUpdateCallingFansMutation,
  useDeleteCallingFansMutation,
  useAddDvdInfoMutation,
  useGetSellRvQuery,
  useAddSellRvMutation,
  useGetDvdInfoQuery,
  useGetSingleDvdInfoQuery,
  useUpdateDvdInfoMutation,
  useDeleteDvdInfoMutation,
  useAddGpsMutation,
  useGetGpsQuery,
  useGetSingleGpsQuery,
  useUpdateGpsMutation,
  useDeleteGpsMutation,
  useAddOutdoorMutation,
  useDeleteOutdoorMutation,
  useGetOutdoorQuery,
  useGetSingleOutdoorQuery,
  useUpdateOutdoorMutation,
  useAddSurroundSoundMutation,
  useGetSurroundSoundQuery,
  useGetSingleSurroundSoundQuery,
  useDeleteSurroundSoundMutation,
  useUpdateSurroundSoundMutation,
  useAddInternetSatettlingMutation,
  useDeleteInternetSatettlingMutation,
  useGetInternetSatettlingQuery,
  useGetSingleInternetSatettlingQuery,
  useUpdateInternetSatettlingMutation,
  useAddRouterMutation,
  useDeleteRouterMutation,
  useGetRouterQuery,
  useGetSingleRouterQuery,
  useUpdateRouterMutation,
  useAddMaintanceMutation,
  useGetMaintanceQuery,
  useGetMaintanceAllQuery,
  useDeleteMaintanceMutation,
  useGetSingleMaintanceQuery, useUpdateMaintanceMutation, useMarkMaintenanceCompleteMutation,
  useAddMemberMutation,
  useGetMemberShipQuery,
  useDeleteMemberShipMutation,useGetSingleMembershipQuery,useUpdateMemberShipMutation,
  useGetInsuranceCompanyQuery,
  useAddReportsMutation,
  useDeleteReportsMutation,
  useGetReportsQuery,
  useGetSingleReportsQuery,
  useUpdateReportsMutation,
  useGetFavouriteReportsQuery,
  useAddFavouriteReportsMutation,
  useAddRepairMutation,
  useDeleteRepairMutation,
  useAddBalkItemCheckListMutation,useAddCheckListMutation,useGetSingleCheckListQuery, useGetCheckListQuery,useUpdateCheckListMutation,useDeleteCheckListMutation,
  useGetRepairQuery,
  useGetSingleRepairQuery,
  useUpdateRepairMutation,
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseQuery,
  useGetSingleExpenseQuery,
  useUpdateExpenseMutation,
  useAddCampMutation,useDeleteCampMutation,useGetCampQuery,useGetSingleCampQuery,useUpdateCampMutation,useUpdateMileagoMutation,useUpdateSelectRvMutation,
  useAddFuelLogMutation,useGetFuelLogsQuery,useGetFuelStatsQuery,useGetSingleFuelLogQuery,useUpdateFuelLogMutation,useDeleteFuelLogMutation,
  useAddGeneratorLogMutation,useGetGeneratorLogsQuery,useGetSingleGeneratorLogQuery,useUpdateGeneratorLogMutation,useDeleteGeneratorLogMutation,
  useAddRepairOrderMutation,useGetRepairOrdersQuery,useGetSingleRepairOrderQuery,useUpdateRepairOrderMutation,useDeleteRepairOrderMutation,useUpdateRepairOrderStatusMutation,
  useGetSmartSuggestionsQuery,
  useGetComponentsQuery,
  useGetSingleComponentQuery,
  useAddComponentMutation,
  useUpdateComponentMutation,
  useDeleteComponentMutation,
  useMarkComponentReplacedMutation,
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useGenerateNotificationsMutation,
  useUpdateNotificationPreferencesMutation,
} = routesApi;
