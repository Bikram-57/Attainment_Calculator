import { useSelector } from 'react-redux';
import './App.css'
import { Footer, NavBar, SideBar } from './Components/index'
import { Outlet } from 'react-router-dom'

function App() {
	const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
	const mintShade = '#00A19B';
    const mintDarkShade = '#008985';
    const latteShade = '#fffaf3';
    const latteDarkShade = '#e4ddd3';
    const fontShade = '#ffffff';
	return (
		<div className='flex h-screen'>
			<SideBar />
			<div
				className={`
					flex flex-col w-full bg-[${latteDarkShade}]
					transition-all duration-300 ease-in-out
					${isOpen ? 'ml-[17%]' : 'ml-0'}
				`}
			>
				<NavBar />
				{/* <div className={`bg-[${latteShade}] flex-1 m-4 mb-0 rounded-md overflow-hidden`}> */}
				<div className={`bg-[${latteShade}] flex-1 m-4 mb-0 rounded-md overflow-hidden`}>
					<Outlet />
				</div>
				{/* Footer */}
				<Footer />
			</div>
		</div>
		// <div className='flex h-screen'>
		// 	<SideBar />
		// 	<div className='flex flex-col w-full bg-gray-300'>
		// 	{/* <div className="flex flex-col flex-1 bg-gray-300"> */}
		// 		<NavBar />
		// 		<div className='bg-white flex-1 m-4 rounded-md overflow-hidden'>
		// 			<Outlet />
		// 		</div>
		// 		{/* Add a Footer component */}
		// 	</div>
		// </div>
	)
}

export default App
