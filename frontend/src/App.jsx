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
				<div
					className='flex-1 min-h-0 m-4 mb-0 rounded-md overflow-y-auto'
					style={{ backgroundColor: COLORS.latte }}
				>
					<Outlet />
				</div>
				<Footer />
			</div>
		</div>
	)
}

export default App
