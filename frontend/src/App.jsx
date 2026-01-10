import { useState } from 'react'
import './App.css'
import { NavBar, SideBar } from './Components/index'

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true)

	return (
		<div className='flex'>
			<SideBar isOpen={isSideBarOpen}/>
			<div className='w-full bg-gray-300 h-screen'>
			{/* <div className="flex flex-col flex-1 bg-gray-300"> */}
				<NavBar toggleSideBar={() => setIsSideBarOpen(prev => !prev)}/>
				{/* <Outlet /> */}
			</div>
		</div>
	)
}

export default App
