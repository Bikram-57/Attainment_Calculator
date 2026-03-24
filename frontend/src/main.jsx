import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Faculty, Subject, UploadData } from './Components/index.js'

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
				element: <Faculty />
			},
			{
				path: 'subject/',
				element: <Subject />
			},
			{
				path: 'upload-data/',
				element: <UploadData />
			},
		]
	}
])

createRoot(document.getElementById('root')).render(
	// <StrictMode>
		<RouterProvider router={router} />
	// </StrictMode>,
)
