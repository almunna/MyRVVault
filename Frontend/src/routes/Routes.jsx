import { Root } from "../layout/Root";
import { AboutPage } from "../Pages/CompanyPage/AboutPage";
import { CompanyPage } from "../Pages/CompanyPage/CompanyPage";
import { TechPartnerPage } from "../Pages/CompanyPage/TechPartnerPage";
import { ContuctUsPage } from "../Pages/ContactUsPage/ContuctUsPage";
import { HomePage } from "../Pages/HomePage/HomePage";
import { createBrowserRouter } from "react-router-dom";
import { StructuredCabilingPage } from "../Pages/ServicesPage/StructuredCabilingPage";
import { BreakFixServicesPage } from "../Pages/ServicesPage/BreakFixServicesPage";
import { SubmitTicketPage } from "../Pages/SubmitTicketPage.jsx/SubmitTicketPage";
import { BlogPage } from "../Pages/BlogPage/BlogPage";
import Login from "../Auth/Login";
import ForgotPassword from "../Auth/ForgotPassword";
import Verification from "../Auth/Verification";
import NewPassword from "../Auth/NewPassword";
import SignUp from "../Auth/SignUp";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import { OngoingTicketPage } from "../Pages/ProfilePage/OngoingTicketPage";
import NewExpense from "../Pages/newExpense/NewExpense";
import Information from "../Pages/information/Information";
import Reports from "../Pages/reports/Reports";
import MyReport from "../Pages/reports/MyReport";
import AddMembership from "../Pages/reports/AddMembership";
import AddMembershipForm from "../Pages/reports/AddMembershipForm";
import UpdateExisting from "../Pages/reports/UpdateExisting";
import InsuranceInfo from "../Pages/insuranceInfo/InsuranceInfo";
import InsuranceCompanyInfo from "../Pages/insuranceInfo/InsuranceCompanyInfo";
import UpdatingCompanyInfo from "../Pages/insuranceInfo/UpdatingCompanyInfo";
import RvSold from "../Pages/rvSold/RvSold";
import RvSoldInformationForm from "../Pages/rvSold/RvSoldInformationForm";
import AddRv from "../Pages/addRv/AddRv";
import UpdateExistMaintainanceOrder from "../Pages/addRv/UpdateExistMaintainanceOrder";
import CampgroundReview from "../Pages/campgroundReview/CampgroundReview";
import ViewAllTrip from "../Pages/campgroundReview/ViewAllTrip";
import TripDetails from "../Pages/campgroundReview/TripDetails";
import UpcomingMaintenance from "../Pages/upcomingMaintenance/UpcomingMaintenance";
import NewRepair from "../Pages/newRepair/NewRepair";
import FavouriteReport from "../Pages/reports/FavouriteReport";
import NewMaintenace from "../Pages/newMaintenace/NewMaintenace";
import TireInformation from "../Pages/tireInformation/TireInformation";
import UpdateRepairOrder from "../Pages/newRepair/UpdateRepairOrder";
import AddBelt from "../Pages/information/AddBelt";
import AddAnOilFilter from "../Pages/information/AddAnOilFilter";
import AddAnFueltFilter from "../Pages/information/AddAnFueltFilter";
import AddOtherBelt from "../Pages/information/AddOtherBelt";
import AddNewMaintanceSchedule from "../Pages/newMaintenace/AddNewMaintanceSchedule";
import UpdateMaintanceSchedule from "../Pages/newMaintenace/UpdateMaintanceSchedule";
import Tire from "../Pages/tire/Tire";
import AddTire from "../Pages/tire/AddTire";
import UpdateTire from "../Pages/tire/UpdateTire";
import AddNewExpense from "../Pages/newExpense/AddNewExpense";
import UpdateNewExpense from "../Pages/newExpense/UpdateNewExpense";
import AddNewRepair from "../Pages/newRepair/AddNewRepair";
import HavcApplication from "../Pages/hvac/HavcApplication";
import Details from "../Pages/hvac/Details";
import Add from "../Pages/hvac/Add";
import Update from "../Pages/hvac/Update";
import HeaterInfo from "../Pages/hvac/HeaterInfo";
import WaterPumpInfo from "../Pages/hvac/WaterPumpInfo";
import WasherInfo from "../Pages/hvac/WasherInfo";
import WaterHeater from "../Pages/hvac/WaterHeater";
import ToiletInfo from "../Pages/hvac/ToiletInfo";
import TVInfo from "../Pages/hvac/TVInfo";
import DryerInfo from "../Pages/hvac/DryerInfo";
import ExhaustInfo from "../Pages/hvac/ExhaustInfo";
import VentFansInfo from "../Pages/hvac/VentFansInfo";
import DishwasherInfo from "../Pages/hvac/DishwasherInfo";
import CellingInfo from "../Pages/hvac/CellingInfo";
import RouterInfo from "../Pages/hvac/RouterInfo";
import InternetInfo from "../Pages/hvac/InternetInfo";
import SurroundInfo from "../Pages/hvac/SurroundInfo";
import OutdoorInfo from "../Pages/hvac/OutdoorInfo";
import GPSInfo from "../Pages/hvac/GPSInfo";
import DVDInfo from "../Pages/hvac/DVDInfo";
import AddSoldRV from "../Pages/rvSold/AddSoldRV";
import CheckList from "../Pages/checklist/CheckList";
import AddChecklist from "../Pages/checklist/AddChecklist";
import ChecklistDetails from "../Pages/checklist/ChecklistDetails";
import AddHeater from "../Pages/hvac/AddHeater";
import AddWaterPump from "../Pages/hvac/AddWaterPump";
import AddWasherInfo from "../Pages/hvac/AddWasherInfo";
import AddWaterHeater from "../Pages/hvac/AddWaterHeater";
import AddToiletInfo from "../Pages/hvac/AddToiletInfo";
import AddTvInfo from "../Pages/hvac/AddTvInfo";
import AddDryerInfo from "../Pages/hvac/AddDryerInfo";
import AddExhaustFansInfo from "../Pages/hvac/AddExhaustFansInfo";
import AddVentFans from "../Pages/hvac/AddVentFans";
import AddDishWasherInfo from "../Pages/hvac/AddDishWasherInfo";
import AddCellingFans from "../Pages/hvac/AddCellingFans";
import AddDvdInfo from "../Pages/hvac/AddDvdInfo";
import AddgpsInfo from "../Pages/hvac/AddgpsInfo";
import AddOutdoorRadio from "../Pages/hvac/AddOutdoorRadio";
import AddSurround from "../Pages/hvac/AddSurround";
import AddInternet from "../Pages/hvac/AddInternet";
import AddRouter from "../Pages/hvac/AddRouter";
import SignVerify from "../Auth/SignVerify";
import UpdateAirConditionar from "../Pages/hvac/UpdateAirConditionar";
import UpdateHeaterInfo from "../Pages/hvac/UpdateHeaterInfo";
import UpdateWaterPump from "../Pages/hvac/UpdateWaterPump";
import UpdateWasherInfo from "../Pages/hvac/UpdateWasherInfo";
import UpdateWaterHeater from "../Pages/hvac/UpdateWaterHeater";
import UpdateToilet from "../Pages/hvac/UpdateToilet";
import UpdateTv from "../Pages/hvac/UpdateTv";
import UpdateDryer from "../Pages/hvac/UpdateDryer";
import UpdateExhaust from "../Pages/hvac/UpdateExhaust";
import UpdateVentFans from "../Pages/hvac/UpdateVentFans";
import UpdateDishwasher from "../Pages/hvac/UpdateDishwasher";
import UpdateCallingFans from "../Pages/hvac/UpdateCallingFans";
import UpdateDvd from "../Pages/hvac/UpdateDvd";
import UpdateGps from "../Pages/hvac/UpdateGps";
import UpdateOutdoor from "../Pages/hvac/UpdateOutdoor";
import UpdateSurround from "../Pages/hvac/UpdateSurround";
import UpdateInternetStelling from "../Pages/hvac/UpdateInternetStelling";
import UpdateRouter from "../Pages/hvac/UpdateRouter";
import ChassisInfo from "../Pages/hvac/ChassisInfo";
import UpdateChassis from "../Pages/hvac/UpdateChassis";
import AddReports from "../Pages/reports/AddReports";
import UpdateReports from "../Pages/reports/UpdateReports";
import AddItems from "../Pages/checklist/AddItems";
import Recalls from "../Pages/recalls/Recalls";
import UpdateMember from "../Pages/reports/UpdateMember";
import AboutUs from "../Pages/ProfilePage/AboutUs";
import Terms from "../Pages/ProfilePage/Terms";
import Privecy from "../Pages/ProfilePage/Privecy";
import ProtectedRoute from "../ProtectedRoute";
import OverDue from "../Pages/newMaintenace/OverDue";
import ChessisProtect from "../ChessisProtect";
import MyRv from "../Pages/addRv/MyRv";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <HomePage></HomePage>,
      },
     {
  path: "/newExpense",
  element: <ProtectedRoute><NewExpense /></ProtectedRoute>,
},

{
  path: "/addNewExpense",
  element: <ProtectedRoute><AddNewExpense /></ProtectedRoute>,
},

{
  path: "/updateNewExpense/:id",
  element: <ProtectedRoute><UpdateNewExpense /></ProtectedRoute>,
},

{
  path: "/information",
  element: <ProtectedRoute><Information /></ProtectedRoute>,
},
{
  path: "/myRv",
  element: <ProtectedRoute><MyRv></MyRv></ProtectedRoute>,
},

{
  path: "/chassisInfo",
  element: <ChessisProtect><ChassisInfo /></ChessisProtect>,
},

{
  path: "/chassisInfo/update-chassis/:id",
  element: <ProtectedRoute><UpdateChassis /></ProtectedRoute>,
},

{
  path: "/information/addBelt",
  element: <ProtectedRoute><AddBelt /></ProtectedRoute>,
},

{
  path: "/information/addOiltFilter",
  element: <ProtectedRoute><AddAnOilFilter /></ProtectedRoute>,
},

{
  path: "/information/addFuelFilter",
  element: <ProtectedRoute><AddAnFueltFilter /></ProtectedRoute>,
},

{
  path: "/information/addOtherBeltFilter",
  element: <ProtectedRoute><AddOtherBelt /></ProtectedRoute>,
},

{
  path: "/reports",
  element: <ProtectedRoute><Reports /></ProtectedRoute>,
},

{
  path: "/favouriteReports",
  element: <ProtectedRoute><FavouriteReport /></ProtectedRoute>,
},

{
  path: "/tireInformation",
  element: <ProtectedRoute><TireInformation /></ProtectedRoute>,
},

{
  path: "/havcApplication",
  element: <ProtectedRoute><HavcApplication /></ProtectedRoute>,
},

{
  path: "/details/airConditioner",
  element: <ProtectedRoute><Details /></ProtectedRoute>,
},

{
  path: "/details/airConditioner/updateAirCondition/:id",
  element: <ProtectedRoute><UpdateAirConditionar /></ProtectedRoute>,
},

{
  path: "/details/Heater",
  element: <ProtectedRoute><HeaterInfo /></ProtectedRoute>,
},

{
  path: "/details/Heater/update-heater/:id",
  element: <ProtectedRoute><UpdateHeaterInfo /></ProtectedRoute>,
},

{
  path: "/details/WaterPump",
  element: <ProtectedRoute><WaterPumpInfo /></ProtectedRoute>,
},

{
  path: "/details/WaterPump/updateWaterPump/:id",
  element: <ProtectedRoute><UpdateWaterPump /></ProtectedRoute>,
},

{
  path: "/details/Washer",
  element: <ProtectedRoute><WasherInfo /></ProtectedRoute>,
},

{
  path: "/details/Washer/update-washer/:id",
  element: <ProtectedRoute><UpdateWasherInfo /></ProtectedRoute>,
},

{
  path: "/details/WaterHeater",
  element: <ProtectedRoute><WaterHeater /></ProtectedRoute>,
},

{
  path: "/details/WaterHeater/update-water/:id",
  element: <ProtectedRoute><UpdateWaterHeater /></ProtectedRoute>,
},

{
  path: "/details/Toilet",
  element: <ProtectedRoute><ToiletInfo /></ProtectedRoute>,
},

{
  path: "/details/Toilet/update-toilet/:id",
  element: <ProtectedRoute><UpdateToilet /></ProtectedRoute>,
},

{
  path: "/details/TVInfo",
  element: <ProtectedRoute><TVInfo /></ProtectedRoute>,
},

{
  path: "/details/TVInfo/update-tv/:id",
  element: <ProtectedRoute><UpdateTv /></ProtectedRoute>,
},

{
  path: "/details/Dryer",
  element: <ProtectedRoute><DryerInfo /></ProtectedRoute>,
},

{
  path: "/details/Dryer/update-dryer/:id",
  element: <ProtectedRoute><UpdateDryer /></ProtectedRoute>,
},

{
  path: "/details/Exhaust",
  element: <ProtectedRoute><ExhaustInfo /></ProtectedRoute>,
},

{
  path: "/details/Exhaust/update-exhaust/:id",
  element: <ProtectedRoute><UpdateExhaust /></ProtectedRoute>,
},

{
  path: "/details/VentFans",
  element: <ProtectedRoute><VentFansInfo /></ProtectedRoute>,
},

{
  path: "/details/VentFans/update-ventfans/:id",
  element: <ProtectedRoute><UpdateVentFans /></ProtectedRoute>,
},

{
  path: "/details/Dishwasher",
  element: <ProtectedRoute><DishwasherInfo /></ProtectedRoute>,
},

{
  path: "/details/Dishwasher/update-dishwasher/:id",
  element: <ProtectedRoute><UpdateDishwasher /></ProtectedRoute>,
},

{
  path: "/details/Celling",
  element: <ProtectedRoute><CellingInfo /></ProtectedRoute>,
},

{
  path: "/details/Celling/updateCalling-fans/:id",
  element: <ProtectedRoute><UpdateCallingFans /></ProtectedRoute>,
},

{
  path: "/details/DVD",
  element: <ProtectedRoute><DVDInfo /></ProtectedRoute>,
},

{
  path: "/details/DVD/update-dvd/:id",
  element: <ProtectedRoute><UpdateDvd /></ProtectedRoute>,
},

{
  path: "/details/GPS",
  element: <ProtectedRoute><GPSInfo /></ProtectedRoute>,
},

{
  path: "/details/GPS/updateGps/:id",
  element: <ProtectedRoute><UpdateGps /></ProtectedRoute>,
},

{
  path: "/details/Outdoor",
  element: <ProtectedRoute><OutdoorInfo /></ProtectedRoute>,
},

{
  path: "/details/Outdoor/update-outdoor/:id",
  element: <ProtectedRoute><UpdateOutdoor /></ProtectedRoute>,
},

{
  path: "/details/Surround",
  element: <ProtectedRoute><SurroundInfo /></ProtectedRoute>,
},

{
  path: "/details/Surround/update-surround/:id",
  element: <ProtectedRoute><UpdateSurround /></ProtectedRoute>,
},

{
  path: "/details/Internet_Satellite",
  element: <ProtectedRoute><InternetInfo /></ProtectedRoute>,
},

{
  path: "/details/Internet_Satellite/update-internet/:id",
  element: <ProtectedRoute><UpdateInternetStelling /></ProtectedRoute>,
},

{
  path: "/details/Router",
  element: <ProtectedRoute><RouterInfo /></ProtectedRoute>,
},

{
  path: "/details/Router/update-router/:id",
  element: <ProtectedRoute><UpdateRouter /></ProtectedRoute>,
},

{
  path: "/details/AddHeater",
  element: <ProtectedRoute><AddHeater /></ProtectedRoute>,
},

{
  path: "/details/AddWaterPump",
  element: <ProtectedRoute><AddWaterPump /></ProtectedRoute>,
},

{
  path: "/details/AddWasherInfo",
  element: <ProtectedRoute><AddWasherInfo /></ProtectedRoute>,
},

{
  path: "/details/AddWaterHeater",
  element: <ProtectedRoute><AddWaterHeater /></ProtectedRoute>,
},

{
  path: "/details/AddToiletInfo",
  element: <ProtectedRoute><AddToiletInfo /></ProtectedRoute>,
},

{
  path: "/details/AddTvInfo",
  element: <ProtectedRoute><AddTvInfo /></ProtectedRoute>,
},

{
  path: "/details/AddDryerInfo",
  element: <ProtectedRoute><AddDryerInfo /></ProtectedRoute>,
},

{
  path: "/details/AddExhaustFansInfo",
  element: <ProtectedRoute><AddExhaustFansInfo /></ProtectedRoute>,
},

{
  path: "/details/AddVentFans",
  element: <ProtectedRoute><AddVentFans /></ProtectedRoute>,
},

{
  path: "/details/AddDishWasherInfo",
  element: <ProtectedRoute><AddDishWasherInfo /></ProtectedRoute>,
},

{
  path: "/details/AddCellingFans",
  element: <ProtectedRoute><AddCellingFans /></ProtectedRoute>,
},

{
  path: "/details/AddDvdInfo",
  element: <ProtectedRoute><AddDvdInfo /></ProtectedRoute>,
},

{
  path: "/details/AddgpsInfo",
  element: <ProtectedRoute><AddgpsInfo /></ProtectedRoute>,
},

{
  path: "/details/AddOutdoorRadio",
  element: <ProtectedRoute><AddOutdoorRadio /></ProtectedRoute>,
},

{
  path: "/details/AddSurround",
  element: <ProtectedRoute><AddSurround /></ProtectedRoute>,
},

{
  path: "/details/AddInternet",
  element: <ProtectedRoute><AddInternet /></ProtectedRoute>,
},

{
  path: "/details/AddRouter",
  element: <ProtectedRoute><AddRouter /></ProtectedRoute>,
},

{
  path: "/Add",
  element: <ProtectedRoute><Add /></ProtectedRoute>,
},

{
  path: "/update",
  element: <ProtectedRoute><Update /></ProtectedRoute>,
},

{
  path: "/myreports",
  element: <ProtectedRoute><MyReport /></ProtectedRoute>,
},

{
  path: "/addReports",
  element: <ProtectedRoute><AddReports /></ProtectedRoute>,
},

{
  path: "/updateReports/:id",
  element: <ProtectedRoute><UpdateReports /></ProtectedRoute>,
},

{
  path: "/newRepair",
  element: <ProtectedRoute><NewRepair /></ProtectedRoute>,
},

{
  path: "/addNewRepair",
  element: <ProtectedRoute><AddNewRepair /></ProtectedRoute>,
},

{
  path: "/UpdateRepairsOrder/:id",
  element: <ProtectedRoute><UpdateRepairOrder /></ProtectedRoute>,
},

      {
        path: "/addMembership",
        element: (
          <ProtectedRoute>
            <AddMembership></AddMembership>
          </ProtectedRoute>
        ),
      },
      {
        path: "/updateMembership/:id",
        element: (
          <ProtectedRoute>
            <UpdateMember></UpdateMember>
          </ProtectedRoute>
        ),
      },
      {
        path: "/insuranceInfo",
        element: (
          <ProtectedRoute>
            <InsuranceInfo></InsuranceInfo>
          </ProtectedRoute>
        ),
      },
      {
        path: "/insuranceCompanyInfoForm",
        element: (
          <ProtectedRoute>
            <InsuranceCompanyInfo></InsuranceCompanyInfo>
          </ProtectedRoute>
        ),
      },
      {
        path: "/updatedingInsurance/:id",
        element: (
          <ProtectedRoute>
            <UpdatingCompanyInfo></UpdatingCompanyInfo>
          </ProtectedRoute>
        ),
      },
      {
        path: "/addMembershipForm",
        element: (
          <ProtectedRoute>
            <AddMembershipForm></AddMembershipForm>
          </ProtectedRoute>
        ),
      },
      {
        path: "/UpdateExisting",
        element: (
          <ProtectedRoute>
            <UpdateExisting></UpdateExisting>
          </ProtectedRoute>
        ),
      },
      {
        path: "/campgroundReview",
        element: (
          <ProtectedRoute>
            <CampgroundReview></CampgroundReview>
          </ProtectedRoute>
        ),
      },

      {
        path: "/aboutUs",
        element: <AboutUs></AboutUs>,
      },

      {
        path: "/terms",
        element: <Terms></Terms>,
      },

      {
        path: "/privecy",
        element: <Privecy></Privecy>,
      },

      {
        path: "/newMaintenance",
        element: (
          <ProtectedRoute>
            <NewMaintenace />
          </ProtectedRoute>
        ),
      },

        {
        path: "/maintenanceOverdue",
        element: (
          <ProtectedRoute>
           <OverDue></OverDue>
          </ProtectedRoute>
        ),
      },

      {
        path: "/tire",
        element: (
          <ProtectedRoute>
            <Tire />
          </ProtectedRoute>
        ),
      },

      {
        path: "/recalls",
        element: (
          <ProtectedRoute>
            <Recalls />
          </ProtectedRoute>
        ),
      },

      {
        path: "/AddTire",
        element: (
          <ProtectedRoute>
            <AddTire />
          </ProtectedRoute>
        ),
      },

      {
        path: "/updateTire/:id",
        element: (
          <ProtectedRoute>
            <UpdateTire />
          </ProtectedRoute>
        ),
      },

      {
        path: "/AddNewMaintanceSchedule",
        element: (
          <ProtectedRoute>
            <AddNewMaintanceSchedule />
          </ProtectedRoute>
        ),
      },

      {
        path: "/UpdateMaintanceSchedule/:id",
        element: (
          <ProtectedRoute>
            <UpdateMaintanceSchedule />
          </ProtectedRoute>
        ),
      },

      {
        path: "/upcomingMaintenance",
        element: (
          <ProtectedRoute>
            <UpcomingMaintenance />
          </ProtectedRoute>
        ),
      },

      {
        path: "/rvSold",
        element: (
          <ProtectedRoute>
            <RvSold />
          </ProtectedRoute>
        ),
      },

      {
        path: "/addRv",
        element: (
          
            <AddRv />
          
        ),
      },

      {
        path: "/addSoldRv",
        element: (
          <ProtectedRoute>
            <AddSoldRV />
          </ProtectedRoute>
        ),
      },

      {
        path: "/checklist",
        element: (
          <ProtectedRoute>
            <CheckList />
          </ProtectedRoute>
        ),
      },

      {
        path: "/checklistDetails/:id",
        element: (
          <ProtectedRoute>
            <ChecklistDetails />
          </ProtectedRoute>
        ),
      },

      {
        path: "/addChecklist",
        element: (
          <ProtectedRoute>
            <AddChecklist />
          </ProtectedRoute>
        ),
      },

      {
        path: "/addItems/:id",
        element: (
          <ProtectedRoute>
            <AddItems />
          </ProtectedRoute>
        ),
      },

      {
        path: "/viewAllTrip",
        element: (
          <ProtectedRoute>
            <ViewAllTrip />
          </ProtectedRoute>
        ),
      },

      {
        path: "/tripDetails",
        element: (
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        ),
      },

      {
        path: "/updateExistMaintenance",
        element: (
          <ProtectedRoute>
            <UpdateExistMaintainanceOrder />
          </ProtectedRoute>
        ),
      },

      {
        path: "/rvSoldInsurance",
        element: (
          <ProtectedRoute>
            <RvSoldInformationForm />
          </ProtectedRoute>
        ),
      },

      {
        path: "/company/about-us",
        element: (
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/company/tech-pertners",
        element: (
          <ProtectedRoute>
            <TechPartnerPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/services/Structure-Cabling",
        element: (
          <ProtectedRoute>
            <StructuredCabilingPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/services/Break-FixServices",
        element: (
          <ProtectedRoute>
            <BreakFixServicesPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/contactUs",
        element: (
          <ProtectedRoute>
            <ContuctUsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/blog",
        element: (
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/submit-a-ticket",
        element: (
          <ProtectedRoute>
            <SubmitTicketPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/profilePage",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/profilePage/ongoing-tickets",
        element: (
          <ProtectedRoute>
            <OngoingTicketPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth/login",
    element: <Login></Login>,
  },
  {
    path: "/auth/signUp",
    element: <SignUp></SignUp>,
  },
  {
    path: "/auth/signUp/verify-email",
    element: <SignVerify></SignVerify>,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword></ForgotPassword>,
  },

  {
    path: "/auth/verification",
    element: <Verification></Verification>,
  },
  {
    path: "/auth/update-password",
    element: <NewPassword></NewPassword>,
  },
]);
