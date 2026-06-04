import { IoOptionsOutline } from "react-icons/io5";
import { CiMenuKebab } from "react-icons/ci";
import { FaFileUpload } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { BiSolidReport } from "react-icons/bi";
import { LiaChartBarSolid } from "react-icons/lia";
import { LuNotebookText } from "react-icons/lu";
import { ImStatsBars2 } from "react-icons/im";
import { BsCardChecklist } from "react-icons/bs";
import { HiMiniUsers } from "react-icons/hi2";
import { FaGraduationCap } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

function SideBar() {
    const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
    const mintShade = '#00A19B';
    const mintDarkShade = '#008985';
    const latteShade = '#fffaf3';
    const latteDarkShade = '#e4ddd3';
    const fontShade = '#ffffff';

    return (
        // <div className={`h-screen bg-gray-50 ${isOpen ? 'w-[20%] translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 ease-in-out overflow-hidden`}>
        // <div
        //     className={`
        //         fixed top-0 left-0 h-screen w-[17%] bg-gray-50
        //         transform transition-transform duration-300 ease-in-out
        //         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        //     `}
        // >
        <div
            className={`
                fixed top-0 left-0 h-screen w-[17%] bg-[${mintShade}]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* <div className='h-15 w-full p-2 flex gap-2 justify-between items-center text-blue-900 bg-white'> */}
            <div className={`h-15 w-full p-2 flex gap-2 justify-between items-center text-[${mintShade}] bg-[${latteShade}]`}>
                <FaGraduationCap className='text-5xl' />
                <div className='text-xs font-bold'>Student Performance Assessment for Outcome Based Education</div>
            </div>
            <div className={`p-3 font-semibold text-lg text-[${fontShade}]`}>
                <div className='flex items-center gap-1'>
                    <IoOptionsOutline />
                    <div>Dashboard</div>
                </div>
                <div className='my-4'>
                    <div className='flex items-center gap-1'>
                        <CiMenuKebab />
                        <div>Menu</div>
                    </div>
                    <div className=''>
                        <NavLink
                            to='/upload-data'
                            // className={({ isActive }) => (
                            //     `${isActive ? 'bg-blue-100 text-blue-900' : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            // )}
                            // className={({ isActive }) => (
                            //     `${isActive ? `bg-[${latteShade}] text-[${mintDarkShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            // )}
                            className={({ isActive }) => (
                                `${isActive ? `bg-[${mintDarkShade}] text-[${fontShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            )}
                        >
                            <FaFileUpload />
                            <div>Upload Data</div>
                        </NavLink>
                        <NavLink
                            to='/fetch-data'
                            // className={({ isActive }) => (
                            //     `${isActive ? `bg-[${latteShade}] text-[${mintDarkShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            // )}
                            className={({ isActive }) => (
                                `${isActive ? `bg-[${mintDarkShade}] text-[${fontShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            )}
                        >
                            <FaFileDownload />
                            <div>Fetch Data</div>
                        </NavLink>
                        <NavLink
                            to='/co_po_relations'
                            className={({ isActive }) => (
                                `${isActive ? `bg-[${mintDarkShade}] text-[${fontShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 mt-4 px-6`
                            )}
                        >
                            <IoMdCloudUpload />
                            <div>CO-PO Relation</div>
                        </NavLink>
                        <div className='flex items-center gap-1 mt-4 px-6'>
                            <IoMdCloudUpload />
                            <div>Direct Attainment</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 my-4'>
                        <BiSolidReport />
                        <div>Analysis</div>
                    </div>
                    <div className='flex items-center gap-1 px-6'>
                        <LiaChartBarSolid />
                        <div>Subject Report</div>
                    </div>
                    <div className='flex items-center gap-1 my-4 '>
                        <LuNotebookText />
                        <div>Subjects</div>
                    </div>
                    <div>
                        {/* <div className='flex items-center gap-1 px-6'>
                            <ImStatsBars2 />
                            <div>Manage Subjects</div>
                        </div> */}
                        <NavLink
                            to='/subject'
                            className={({ isActive }) => (
                                `${isActive ? `bg-[${mintDarkShade}] text-[${fontShade}] font-bold` : 'bg-transparent'} flex items-center gap-1 px-6`
                            )}
                        >
                            <ImStatsBars2 />
                            <div>Manage Subjects</div>
                        </NavLink>
                        {/* <div className='flex items-center gap-1 px-6 my-4'>
                            <BsCardChecklist />
                            <div>Assign Subjects</div>
                        </div> */}
                        <NavLink to='/' className='flex items-center gap-1 px-6 my-4'>
                            <BsCardChecklist />
                            <div>Assign Subjects</div>
                        </NavLink>
                    </div>
                    <div className='flex items-center gap-1 my-4'>
                        <CiMenuKebab />
                        <div>Faculty</div>
                    </div>
                    <NavLink
                        to='/users'
                        className={({ isActive }) => (
                            `${isActive ? `bg-[${mintDarkShade}] text-[${fontShade}] font-bold` : 'bg-transparent'}
                            flex items-center gap-1 px-6 cursor-pointer`
                        )}
                    >
                        <HiMiniUsers />
                        <div>Manage Faculty</div>
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export default SideBar