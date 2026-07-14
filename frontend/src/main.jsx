import { createRoot } from 'react-dom/client'
import './index.css'
import './axiosInterceptor.js'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
	Faculty,
	Subject,
	UploadData,
	FetchData,
	COAttainment,
	FinalCOAttainment,
	POAttainment,
	CoPoRelation,
	ContactUs,
	AssignSubjects,
	UnderDevelopment,
	PageNotFound,
	Profile,
	ProtectedRoute,
	Login,
	ForgotPassword,
	Rubrics,
	DirectAttainment,
	DownloadBatchReport,
	Dashboard,
	SubjectAnalysis,
	PublicRoute,
} from './Components/index.js'
import store from './store/store.js'
import { Provider } from 'react-redux'
import DownloadSubjectReport from './Components/DownloadReports/DownloadSubjectReport.jsx'


const router = createBrowserRouter([
	// Public Routes
	// {
	// 	path: '/login',
	// 	element: <Login />,
	// },
	// {
	// 	path: '/forgot-password',
	// 	element: <ForgotPassword />,
	// },
	{
		path: '/login',
		element: (
			<PublicRoute>
				<Login />
			</PublicRoute>
		),
	},
	{
		path: '/forgot-password',
		element: (
			<PublicRoute>
				<ForgotPassword />
			</PublicRoute>
		),
	},

	// Protected Routes
	{
		element: (
			<ProtectedRoute>
				<App />
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: <Dashboard />,
				handle: { title: 'Dashboard' },
			},
			{
				path: 'assign-subjects',
				element: <AssignSubjects />,
				handle: { title: 'Assign Subjects' },
			},
			{
				path: 'profile',
				element: <Profile />,
				handle: { title: 'Profile Page' },
			},
			{
				path: 'users',
				element: <Faculty />,
				handle: { title: 'Manage Faculty' },
			},
			{
				path: 'subject',
				element: <Subject />,
				handle: { title: 'Manage Subjects' },
			},
			{
				path: 'upload-data',
				element: <UploadData />,
				handle: { title: 'Upload Data' },
			},
			{
				path: 'fetch-data',
				element: <FetchData />,
				handle: { title: 'Fetch Data' },
			},
			{
				path: 'co_po_relation',
				element: <CoPoRelation />,
				handle: { title: 'CO PO Relations' },
			},
			{
				path: 'direct-attainment',
				element: <DirectAttainment />,
				handle: { title: 'Direct Attainment' },
			},
			{
				path: 'download-subject-report',
				element: <DownloadSubjectReport />,
				handle: { title: 'Download Reports' },
			},
			{
				path: 'download-batch-report',
				element: <DownloadBatchReport />,
				handle: { title: 'Download Reports' },
			},
			{
				path: 'rubrics',
				element: <Rubrics />,
				handle: { title: 'Rubrics' },
			},
			{
				path: 'subject-analysis',
				element: <SubjectAnalysis />,
				handle: { title: 'Subject Analysis' },
			},

			// Pages that still use App Layout
			{
				path: 'contact-us',
				element: <ContactUs />,
				handle: { title: 'Contact Us' },
			},
			
			{
				path: '*',
				element: <PageNotFound />,
				handle: { title: '404 Page' },
			},
		],
	},

	// Full-screen routes (outside App layout)
	{
		path: 'co-attainment/:academicYear/:course/:subjectId',
		element: (
			<ProtectedRoute>
				<COAttainment />
			</ProtectedRoute>
		),
		handle: { title: 'CO Attainment' },
	},
	{
		path: 'final-co-attainment/:academicYear/:course/:subjectId',
		element: (
			<ProtectedRoute>
				<FinalCOAttainment />
			</ProtectedRoute>
		),
		handle: { title: 'Final CO Attainment' },
	},
	{
		path: 'po-attainment/:academicYear/:course/:subjectId',
		element: (
			<ProtectedRoute>
				<POAttainment />
			</ProtectedRoute>
		),
		handle: { title: 'PO Attainment' },
	},
])


// const router = createBrowserRouter([
// 	{
// 		path: '/',
// 		element: <App />,
// 		children: [
// 			{
// 				path: '/',
// 				element: <AssignSubjects />,
// 				handle: { title: 'Assign Subjects' }
// 			},
// 			{
// 				path: '/profile',
// 				element: <Profile />,
// 				handle: { title: 'Profile Page' }
// 			},
// 			{
// 				path: 'users/',
// 				element: <Faculty />,
// 				handle: { title: 'Manage Faculty' }
// 			},
// 			{
// 				path: 'subject/',
// 				element: <Subject />,
// 				handle: { title: 'Manage Subjects' }
// 			},
// 			{
// 				path: 'upload-data/',
// 				element: <UploadData />,
// 				handle: { title: 'Upload Data' }
// 			},
// 			{
// 				path: 'fetch-data/',
// 				element: <FetchData />,
// 				handle: { title: 'Fetch Data' }
// 			},
// 			{
// 				path: 'co_po_relations/',
// 				element: <CoPoRelations />,
// 				handle: { title: 'CO PO Relations' }
// 			},
// 			{
// 				path: 'direct-attainment/',
// 				element: <UnderDevelopment />,
// 				handle: { title: 'Direct Attainment' }
// 			},
// 			{
// 				path: 'download-reports/',
// 				element: <DownloadReports />,
// 				handle: { title: 'Download Reports' }
// 			},
// 			{
// 				path: 'subject-report/',
// 				element: <UnderDevelopment />,
// 				handle: { title: 'Subject Report' }
// 			},
// 			{
// 				path: '*',
// 				element: <PageNotFound />
// 			},
// 			// {
// 			// 	path: 'co-attainment/:academicYear/:course/:subjectId',
// 			// 	element: <COAttainment />,
// 			// 	handle: { title: 'CO Attainment'}
// 			// },
// 		]
// 	},
// 	{
// 		path: 'co-attainment/:academicYear/:course/:subjectId',
// 		element: <COAttainment />,
// 		handle: { title: 'CO Attainment' }
// 	},
// 	{
// 		path: 'final-co-attainment/:academicYear/:course/:subjectId',
// 		element: <FinalCOAttainment />,
// 		handle: { title: 'Final CO Attainment' }
// 	},
// 	{
// 		path: 'po-attainment/:academicYear/:course/:subjectId',
// 		// path: 'calpo/:academicYear/:course/:subjectId',
// 		element: <POAttainment />,
// 		handle: { title: 'PO Attainment' }
// 	},
// 	{
// 		path: 'contact-us',
// 		// path: 'calpo/:academicYear/:course/:subjectId',
// 		element: <ContactUs />,
// 		handle: { title: 'Contact Us' }
// 	},
// ])

createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
