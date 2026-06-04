import { useSelector } from 'react-redux';
import './App.css'
import { Footer, NavBar, SideBar } from './Components/index'
import { Outlet } from 'react-router-dom'
import { COLORS } from './constants/theme';

function App() {
	const isOpen = useSelector(state => state.sideBar.isSideBarOpen);

	return (
		<div className='flex h-screen'>
			<SideBar />
			<div
				className={`
					flex flex-col w-full transition-all duration-300 ease-in-out
					${isOpen ? 'ml-[17%]' : 'ml-0'}
				`}
				style={{ backgroundColor: COLORS.latteDark }}
			>
				<NavBar />
				{/* <div className={`bg-[${latteShade}] flex-1 m-4 mb-0 rounded-md overflow-hidden`}> */}
				<div
					className='flex-1 m-4 mb-0 rounded-md overflow-hidden'
					style={{ backgroundColor: COLORS.latte }}
				>
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
