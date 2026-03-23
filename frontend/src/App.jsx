import { useState } from 'react'
import './App.css'
import { NavBar, SideBar } from './Components/index'
import { Outlet } from 'react-router-dom'

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true)

	return (
		<div className='flex h-screen'>
			<SideBar isOpen={isSideBarOpen}/>
			<div className='flex flex-col w-full bg-gray-300'>
			{/* <div className="flex flex-col flex-1 bg-gray-300"> */}
				<NavBar toggleSideBar={() => setIsSideBarOpen(prev => !prev)}/>
				<div className='bg-white flex-1 m-4 rounded-md overflow-hidden'>
					<Outlet />
				</div>
				{/* Add a Footer component */}
			</div>
		</div>
	)
}

export default App
