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
import { IoMdDownload } from "react-icons/io";
import { SiGoogleclassroom } from "react-icons/si";
import { MdTopic } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { COLORS } from "../constants/theme";

function SideBar() {
    const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
    const mintShade = '#00A19B';
    const mintDarkShade = '#008985';
    const latteShade = '#fffaf3';
    const latteDarkShade = '#e4ddd3';
    const fontShade = '#ffffff';
    return (
        <div
            className={`
                fixed top-0 left-0 h-screen overflow-y-auto w-[17%] transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ backgroundColor: COLORS.mint }}
        >
            <div
                className='h-15 w-full p-2 flex gap-2 justify-between items-center'
                style={{
                    backgroundColor: COLORS.latte,
                    color: COLORS.mint
                }}
            >
                <FaGraduationCap className='text-5xl' />
                <div className='text-xs font-bold'>Student Performance Assessment for Outcome Based Education</div>
            </div>
            <div
                className='p-3 font-semibold text-md'
                style={{ color: COLORS.font }}
            >
                <div className='flex items-center gap-1'>
                    <IoOptionsOutline />
                    <div>Dashboard</div>
                </div>

                <div className='my-2'>
                    {/* Menu */}
                    <div className='flex items-center gap-1 text-lg'>
                        <CiMenuKebab />
                        <div>Menu</div>
                    </div>
                    <div className=''>
                        <NavLink
                            to='/upload-data'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <FaFileUpload />
                            <div>Upload Data</div>
                        </NavLink>
                        <NavLink
                            to='/fetch-data'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <FaFileDownload />
                            <div>Fetch Data</div>
                        </NavLink>

                        <NavLink
                            to='/co_po_relations'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <IoMdCloudUpload />
                            <div>CO-PO Relation</div>
                        </NavLink>
                        <NavLink
                            to='/direct-attainment'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <IoMdCloudUpload />
                            <div>Direct Attainment</div>
                        </NavLink>
                    </div>
                    {/* Downloads */}
                    <div className="flex items-center gap-1 my-2 text-lg">
                        <IoMdDownload />
                        <div>Downloads</div>
                    </div>
                    <div>
                        <NavLink
                            to='/download-subject-report'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <MdTopic />
                            <div>Subject Report</div>
                        </NavLink>
                        <NavLink
                            to='/download-batch-report'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <SiGoogleclassroom />
                            <div>Batch Report</div>
                        </NavLink>
                    </div>

                    {/* Rubrics */}
                    <div className="flex items-center gap-1 my-2 text-lg">
                        <BiSolidReport />
                        <div>Rubrics</div>
                    </div>
                    <div>
                        <NavLink
                            to='/rubrics'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <BiSolidReport />
                            <div>Manage Rubrics</div>
                        </NavLink>
                    </div>

                    {/* Analysis */}
                    <div className='flex items-center gap-1 my-2 text-lg'>
                        <BiSolidReport />
                        <div>Analysis</div>
                    </div>
                    <NavLink
                        to='/subject-report'
                        className={({ isActive }) => (
                            `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6`
                        )}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                            color: COLORS.font
                        })}
                    >
                        <LiaChartBarSolid />
                        <div>Subject Report</div>
                    </NavLink>

                    {/* Subjects */}
                    <div className='flex items-center gap-1 my-2 text-lg'>
                        <LuNotebookText />
                        <div>Subjects</div>
                    </div>
                    <div>
                        <NavLink
                            to='/subject'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 px-6`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <ImStatsBars2 />
                            <div>Manage Subjects</div>
                        </NavLink>
                        <NavLink
                            to='/'
                            className={({ isActive }) => (
                                `${isActive ? 'font-bold' : ''} flex items-center gap-1 mt-2 px-6 cursor-pointer`
                            )}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                                color: COLORS.font
                            })}
                        >
                            <BsCardChecklist />
                            <div>Assign Subjects</div>
                        </NavLink>
                    </div>

                    {/* Faculty */}
                    <div className='flex items-center gap-1 my-2 text-lg'>
                        <CiMenuKebab />
                        <div>Faculty</div>
                    </div>
                    <NavLink
                        to='/users'
                        className={({ isActive }) => (
                            `${isActive ? 'font-bold' : ''}
                            flex items-center gap-1 px-6 cursor-pointer`
                        )}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                            color: COLORS.font
                        })}
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