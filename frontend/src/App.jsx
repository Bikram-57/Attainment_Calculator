import './App.css'
import { NavBar, SideBar } from './Components/index'

function App() {

	return (
		<div className='flex'>
			<SideBar />
			<div className='w-full bg-red-00 h-screen'>
				<NavBar />
				{/* <Outlet /> */}
			</div>
		</div>
	)
}

export default App
