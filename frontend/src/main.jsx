import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Faculty, Subject, UploadData, FetchData, COAttainment } from './Components/index.js'
import store from './store/store.js'
import {Provider} from 'react-redux'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				// element: <Faculty />
			},
			{
				path: 'users/',
				element: <Faculty />,
				handle: { title: 'Manage Faculty'}
			},
			{
				path: 'subject/',
				element: <Subject />,
				handle: { title: 'Manage Subjects'}
			},
			{
				path: 'upload-data/',
				element: <UploadData />,
				handle: { title: 'Upload Data'}
			},
			{
				path: 'fetch-data/',
				element: <FetchData />,
				handle: { title: 'Fetch Data'}
			},
			{
				path: 'co-attainment/:subjectId/:academicYear',
				element: <COAttainment />,
				handle: { title: 'CO Attainment'}
			},
		]
	}
])

createRoot(document.getElementById('root')).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
)
