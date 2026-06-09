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
} from './Components/index.js'
import store from './store/store.js'
import { Provider } from 'react-redux'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <AssignSubjects />,
				handle: { title: 'Assign Subjects' }
			},
			{
				path: 'users/',
				element: <Faculty />,
				handle: { title: 'Manage Faculty' }
			},
			{
				path: 'subject/',
				element: <Subject />,
				handle: { title: 'Manage Subjects' }
			},
			{
				path: 'upload-data/',
				element: <UploadData />,
				handle: { title: 'Upload Data' }
			},
			{
				path: 'fetch-data/',
				element: <FetchData />,
				handle: { title: 'Fetch Data' }
			},
			{
				path: 'download-reports',
				element: <DownloadReports />,
				handle: { title: 'Download Reports' }
			},
			{
				path: 'co_po_relations/',
				element: <CoPoRelations />,
				handle: { title: 'CO PO Relations' }
			},
			// {
			// 	path: 'co-attainment/:academicYear/:course/:subjectId',
			// 	element: <COAttainment />,
			// 	handle: { title: 'CO Attainment'}
			// },
		]
	},
	{
		path: 'co-attainment/:academicYear/:course/:subjectId',
		element: <COAttainment />,
		handle: { title: 'CO Attainment' }
	},
	{
		path: 'final-co-attainment/:academicYear/:course/:subjectId',
		element: <FinalCOAttainment />,
		handle: { title: 'Final CO Attainment' }
	},
	{
		path: 'po-attainment/:academicYear/:course/:subjectId',
		// path: 'calpo/:academicYear/:course/:subjectId',
		element: <POAttainment />,
		handle: { title: 'PO Attainment' }
	},
	{
		path: 'contact-us',
		// path: 'calpo/:academicYear/:course/:subjectId',
		element: <ContactUs />,
		handle: { title: 'Contact Us' }
	},
])

createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
