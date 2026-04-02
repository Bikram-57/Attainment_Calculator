import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Faculty, Subject, UploadData, FetchData } from './Components/index.js'

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
		]
	}
])

createRoot(document.getElementById('root')).render(
	// <StrictMode>
		<RouterProvider router={router} />
	// </StrictMode>,
)
