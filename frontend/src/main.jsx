import { createRoot } from 'react-dom/client'
import './index.css'
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
	CoPoRelations,
	ContactUs,
	AssignSubjects,
	DownloadReports,
	UnderDevelopment,
	PageNotFound,
	Profile,
	ProtectedRoute,
	Login,
	ForgotPassword,
	Rubrics,
} from './Components/index.js'
import store from './store/store.js'
import { Provider } from 'react-redux'


const router = createBrowserRouter([
	// Public Routes
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/forgot-password',
		element: <ForgotPassword />,
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
				path: 'co_po_relations',
				element: <CoPoRelations />,
				handle: { title: 'CO PO Relations' },
			},
			{
				path: 'direct-attainment',
				element: <UnderDevelopment />,
				handle: { title: 'Direct Attainment' },
			},
			{
				path: 'download-reports',
				element: <DownloadReports />,
				handle: { title: 'Download Reports' },
			},
			{
				path: 'rubrics',
				element: <Rubrics />,
				handle: { title: 'Rubrics' },
			},
			{
				path: 'subject-report',
				element: <UnderDevelopment />,
				handle: { title: 'Subject Report' },
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
