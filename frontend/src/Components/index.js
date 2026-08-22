// AssignSubjects
import AssignSubjects from "./AssignSubjects/AssignSubjects";
import AssignSingleSubjectForm from "./AssignSubjects/AssignSingleSubjectForm";
import AssignMultipleSubjectForm from "./AssignSubjects/AssignMultipleSubjectForm";
import AssignSubjectForm from "./AssignSubjects/AssignSubjectForm";
import AssignSubjectsHeader from "./AssignSubjects/AssignSubjectsHeader";

// Attainment
import {
    Attainment,
    COAttainment,
    COAttainTable,
    FinalCOAttainment,
    FinalCOAttainTable,
    POAttainment,
    POAttainTable,
} from "./Attainment/index";

// CoPoRelation
import CoPoRelation from "./CoPoRelation/CoPoRelation";
import UploadCoPoRelation from "./CoPoRelation/UploadCoPoRelation";
import CoPoRelationHeader from "./CoPoRelation/CoPoRelationHeader";
import ViewCoPoRelation from "./CoPoRelation/ViewCoPoRelation";
import EditCoPoRelation from "./CoPoRelation/EditCoPoRelation";

// Dashboard
import Dashboard from "./Dashboard/Dashboard";
import Overview from "./Dashboard/Overview";
import RecentActivity from "./Dashboard/RecentActivity";
import ProgressCharts from "./Dashboard/ProgressCharts";

// DirectAttainment
import DirectAttainment from "./DirectAttainment/DirectAttainment";
import DirectAttainmentTable from "./DirectAttainment/DirectAttainmentTable";
import DirectAttainmentHeader from "./DirectAttainment/DirectAttainmentHeader";
import GenerateAttainmentForm from "./DirectAttainment/GenerateAttainmentForm";

// DownloadReports
import DownloadBatchReport from "./DownloadReports/DownloadBatchReport";
import DownloadSubjectReport from "./DownloadReports/DownloadSubjectReport";

// Faculty
import Faculty from "./Faculty/Faculty";
import FacultyHeader from "./Faculty/FacultyHeader";
import AddFacultyForm from "./Faculty/AddFacultyForm";
import FacultyViewModal from "./Faculty/modals/FacultyViewModal";
import FacultyEditModal from "./Faculty/modals/FacultyEditModal";
import FacultyDeleteModal from "./Faculty/modals/FacultyDeleteModal";

// ForgotPassword
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ForgotPassword/ResetPassword";
import VerifyOtp from "./ForgotPassword/VerifyOtp";

// GenerateSheet
import GenerateSheet from "./GenerateSheet/GenerateSheet";
import DownloadSheet from "./GenerateSheet/DownloadSheet";
import DownloadFormat from "./GenerateSheet/DownloadFormat";

// NavBar
import NavBar from "./NavBar/NavBar";
import NavBarMenu from "./NavBar/NavBarMenu";

// Profile
import Profile from "./Profile/Profile";
import ProfileInfoCard from "./Profile/ProfileInfoCard";
import RemoveProfilePicture from "./Profile/RemoveProfilePicture";

// Rubrics
import Rubrics from "./Rubrics/Rubrics";
import RubricsHeader from "./Rubrics/RubricsHeader";
import RubricsViewModal from "./Rubrics/modals/RubricsViewModal";
import RubricsEditModal from "./Rubrics/modals/RubricsEditModal"
import RubricsDeleteModal from "./Rubrics/modals/RubricsDeleteModal"
import AddRubricsForm from "./Rubrics/AddRubricsForm";
import AddMultipleRubrics from "./Rubrics/AddMultipleRubrics";

// SideBar
import SideBar from "./SideBar/SideBar";
import SideBarSection from "./SideBar/SideBarSection";
import SideBarTab from "./SideBar/SideBarTab";

// Subject
import Subject from "./Subject/Subject";
import SubjectHeader from "./Subject/SubjectHeader";
import AddSubject from "./Subject/AddSubject";
import AddMultipleSubjectsForm from "./Subject/AddMultipleSubjectsForm";
import SubjectViewModal from "./Subject/modals/SubjectViewModal";
import SubjectEditModal from "./Subject/modals/SubjectEditModal";
import SubjectDeleteModal from "./Subject/modals/SubjectDeleteModal";
import AddSubjectForm from "./Subject/AddSubjectForm";

// SubjectAnalysis
import SubjectAnalysis from "./SubjectAnalysis/SubjectAnalysis";
import BarGraph from "./SubjectAnalysis/BarGraph";

// Other Components
import ContactUs from "./ContactUs";
import FetchData from "./FetchData";
import Footer from "./Footer";
import Login from "./Login";
import Logout from "./Logout";
import PageNotFound from "./PageNotFound";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import UnderDevelopment from "./UnderDevelopment";
import UploadData from "./UploadData";

// utils
import ActionBtns from "../utils/ActionBtns";
import ErrorSuccessMsg from "../utils/ErrorSuccessMsg";
import Filters from "../utils/Filters";
import Loading from "../utils/Loading";

export {
    NavBar,
    SideBar,
    Faculty,
    FacultyHeader,
    Subject,
    SubjectHeader,
    ActionBtns,
    UploadData,
    FetchData,
    Attainment,
    COAttainment,
    COAttainTable,
    FinalCOAttainment,
    FinalCOAttainTable,
    POAttainment,
    POAttainTable,
    AddFacultyForm,
    FacultyViewModal,
    FacultyEditModal,
    FacultyDeleteModal,
    SubjectViewModal,
    SubjectEditModal,
    SubjectDeleteModal,
    AddSubjectForm,
    CoPoRelation,
    CoPoRelationHeader,
    ViewCoPoRelation,
    EditCoPoRelation,
    Footer,
    ContactUs,
    AddMultipleSubjectsForm,
    AssignSubjects,
    AssignSubjectForm,
    AssignSubjectsHeader,
    Filters,
    UnderDevelopment,
    PageNotFound,
    AddSubject,
    ErrorSuccessMsg,
    Loading,
    Profile,
    ProfileInfoCard,
    ProtectedRoute,
    Login,
    Logout,
    NavBarMenu,
    ForgotPassword,
    ResetPassword,
    VerifyOtp,
    Rubrics,
    RubricsHeader,
    RubricsViewModal,
    RubricsEditModal,
    RubricsDeleteModal,
    AddRubricsForm,
    DirectAttainment,
    DirectAttainmentTable,
    DirectAttainmentHeader,
    GenerateAttainmentForm,
    DownloadBatchReport,
    DownloadSubjectReport,
    SideBarSection,
    SideBarTab,
    SubjectAnalysis,
    Dashboard,
    Overview,
    RecentActivity,
    ProgressCharts,
    BarGraph,
    AssignSingleSubjectForm,
    AssignMultipleSubjectForm,
    PublicRoute,
    RemoveProfilePicture,
    UploadCoPoRelation,
    AddMultipleRubrics,
    GenerateSheet,
    DownloadSheet,
    DownloadFormat,
}