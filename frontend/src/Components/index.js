import NavBar from "./NavBar/NavBar";
import Faculty from "./Faculty/Faculty";
import FacultyHeader from "./Faculty/FacultyHeader";
import Subject from "./Subject/Subject";
import SubjectHeader from "./Subject/SubjectHeader";
import ActionBtns from "./ActionBtns/ActionBtns";
import UploadData from "./UploadData";
import FetchData from "./FetchData";
import {
    Attainment,
    COAttainment,
    COAttainTable,
    FinalCOAttainment,
    FinalCOAttainTable,
    POAttainment,
    POAttainTable,
} from "./Attainment/index";
import AddFacultyForm from "./Faculty/AddFacultyForm";
import FacultyViewModal from "./Faculty/modals/FacultyViewModal";
import FacultyEditModal from "./Faculty/modals/FacultyEditModal";
import FacultyDeleteModal from "./Faculty/modals/FacultyDeleteModal";
import SubjectViewModal from "./Subject/modals/SubjectViewModal";
import SubjectEditModal from "./Subject/modals/SubjectEditModal";
import SubjectDeleteModal from "./Subject/modals/SubjectDeleteModal";
import AddSubjectForm from "./Subject/AddSubjectForm";
import CoPoRelation from "./CoPoRelation/CoPoRelation";
import CoPoRelationHeader from "./CoPoRelation/CoPoRelationHeader";
import ViewCoPoRelation from "./CoPoRelation/ViewCoPoRelation";
import EditCoPoRelation from "./CoPoRelation/EditCoPoRelation";
import Footer from "./Footer";
import ContactUs from "./ContactUs";
import AddMultipleSubjectsForm from "./Subject/AddMultipleSubjectsForm";
import AssignSubjects from "./AssignSubjects/AssignSubjects";
import AssignSubjectForm from "./AssignSubjects/AssignSubjectForm";
import AssignSubjectsHeader from "./AssignSubjects/AssignSubjectsHeader";
import Filters from "../utils/Filters";
import UnderDevelopment from "../utils/UnderDevelopment";
import PageNotFound from "./PageNotFound";
import AddSubject from "./Subject/AddSubject";
import ErrorSuccessMsg from "../utils/ErrorSuccessMsg";
import Loading from "../utils/Loading";
import Profile from "./Profile/Profile";
import ProfileInfoCard from "./Profile/ProfileInfoCard";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Logout from "./Logout";
import NavBarMenu from "./NavBar/NavBarMenu";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ForgotPassword/ResetPassword";
import VerifyOtp from "./ForgotPassword/VerifyOtp";
import Rubrics from "./Rubrics/Rubrics";
import RubricsHeader from "./Rubrics/RubricsHeader";
import RubricsViewModal from "./Rubrics/modals/RubricsViewModal";
import RubricsEditModal from "./Rubrics/modals/RubricsEditModal"
import RubricsDeleteModal from "./Rubrics/modals/RubricsDeleteModal"
import AddRubricsForm from "./Rubrics/AddRubricsForm";
import DirectAttainment from "./DirectAttainment/DirectAttainment";
import DirectAttainmentTable from "./DirectAttainment/DirectAttainmentTable";
import DirectAttainmentHeader from "./DirectAttainment/DirectAttainmentHeader";
import GenerateAttainmentForm from "./DirectAttainment/GenerateAttainmentForm";
import DownloadBatchReport from "./DownloadReports/DownloadBatchReport";
import DownloadSubjectReport from "./DownloadReports/DownloadSubjectReport";
import SideBar from "./SideBar/SideBar";
import SideBarSection from "./SideBar/SideBarSection";
import SideBarTab from "./SideBar/SideBarTab";
import SubjectAnalysis from "./SubjectAnalysis/SubjectAnalysis";
import Dashboard from "./Dashboard/Dashboard";
import Overview from "./Dashboard/Overview";
import RecentActivity from "./Dashboard/RecentActivity";
import ProgressCharts from "./Dashboard/ProgressCharts";
import BarGraph from "./SubjectAnalysis/BarGraph";
import AssignSingleSubjectForm from "./AssignSubjects/AssignSingleSubjectForm";
import AssignMultipleSubjectForm from "./AssignSubjects/AssignMultipleSubjectForm";
import PublicRoute from "./PublicRoute";

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
}