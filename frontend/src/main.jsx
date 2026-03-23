import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Faculty, Subject } from './Components/index.js'

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
			}
		]
	}
])

createRoot(document.getElementById('root')).render(
	// <StrictMode>
		<RouterProvider router={router} />
	// </StrictMode>,
)
