import { useState } from 'react'
import './App.css'
import { NavBar, SideBar } from './Components/index'
import { Outlet } from 'react-router-dom'

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true)

	return (
		<div className='flex'>
			<SideBar isOpen={isSideBarOpen}/>
			<div className='w-full bg-gray-300 h-screen'>
			{/* <div className="flex flex-col flex-1 bg-gray-300"> */}
				<NavBar toggleSideBar={() => setIsSideBarOpen(prev => !prev)}/>
				<div className='bg-white m-4 rounded-md'>
					<Outlet />
				</div>
				{/* Add a Footer component */}
			</div>
		</div>
	)
}

export default App
