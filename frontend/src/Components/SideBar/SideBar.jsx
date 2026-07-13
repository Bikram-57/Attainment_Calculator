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
import { COLORS } from "../../constants/theme";
import SideBarSection from "./SideBarSection";
import SideBarTab from "./SideBarTab";

function SideBar() {
    const isOpen = useSelector(state => state.sideBar.isSideBarOpen);
    const userData = useSelector(state => state.auth.userData);
    const menuList = [
        {
            role: 'faculty',
            text: 'Upload Data',
            to: '/upload-data',
            icon: FaFileUpload,
        },
        {
            role: 'faculty',
            text: 'Fetch Data',
            to: '/fetch-data',
            icon: FaFileDownload,
        },
        {
            role: 'faculty',
            text: 'CO-PO Relation',
            to: '/co_po_relation',
            icon: IoMdCloudUpload,
        },
        {
            role: 'admin',
            text: 'Direct Attainment',
            to: '/direct-attainment',
            icon: IoMdCloudUpload,
        },
    ];

    const downloadList = [
        {
            role: 'faculty',
            text: 'Subject Report',
            to: '/download-subject-report',
            icon: MdTopic,
        },
        {
            role: 'faculty',
            text: 'Batch Report',
            to: '/download-batch-report',
            icon: SiGoogleclassroom,
        },
    ];

    const rubricsList = [
        {
            role: 'admin',
            text: 'Manage Rubrics',
            to: '/rubrics',
            icon: BiSolidReport,
        },
    ];

    const analysisList = [
        {
            role: 'admin',
            text: 'Subject Analysis',
            to: '/subject-analysis',
            icon: LiaChartBarSolid,
        },
    ];

    const subjectList = [
        {
            role: 'admin',
            text: 'Manage Subjects',
            to: '/subject',
            icon: ImStatsBars2,
        },
        {
            role: 'admin',
            text: 'Assign Subjects',
            to: '/assign-subjects',
            icon: BsCardChecklist,
        },
    ];

    const facultyList = [
        {
            role: 'admin',
            text: 'Manage Faculty',
            to: '/users',
            icon: HiMiniUsers,
        },
    ];

    return (
        <div
            className={`
                fixed top-0 left-0 h-screen overflow-y-auto w-[17%] transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ backgroundColor: COLORS.mint }}
        >
            <div
                // className='h-15 w-full p-2 flex gap-2 justify-between items-center'
                className='h-15 w-full p-2 flex justify-center items-center'
                style={{
                    backgroundColor: COLORS.latte,
                    color: COLORS.mint
                }}
            >
                {/* <FaGraduationCap className='text-5xl' /> */}
                {/* <div className='text-xs font-bold'>Student Performance Assessment for Outcome Based Education</div> */}
                <img src="/Final-Logo-Edited.png" height='60' width='60' />
                {/* <div className='text-xl font-bold'>Attainment Calc</div> */}
                <img src="/Final-Logo-Name.png" height='190' width='190' />

            </div>
            <div
                className='p-3 font-semibold text-md'
                style={{ color: COLORS.font }}
            >
                <SideBarTab
                    icon={IoOptionsOutline}
                    to={'/'}
                    text='Dashboard'
                    tabClassNames='flex items-center gap-1 mt-2'
                />

                <div className='my-2'>

                    {/* Menu */}
                    <SideBarSection
                        icon={CiMenuKebab}
                        text='Menu'
                    />
                    <div>
                        {menuList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>

                    {/* Downloads */}
                    <SideBarSection
                        icon={IoMdDownload}
                        text='Downloads'
                    />
                    <div>
                        {downloadList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>


                    {/* Rubrics */}
                    {userData.role === 'admin' &&
                        (
                            <SideBarSection
                                icon={BiSolidReport}
                                text='Rubrics'
                            />
                        )}
                    <div>
                        {rubricsList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>

                    {/* Analysis */}
                    {userData.role === 'admin' &&
                        (
                            <SideBarSection
                                icon={BiSolidReport}
                                text='Analysis'
                            />
                        )}
                    <div>
                        {analysisList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>

                    {/* Subjects */}
                    {userData.role === 'admin' &&
                        (
                            <SideBarSection
                                icon={LuNotebookText}
                                text='Subjects'
                            />
                        )}
                    <div>
                        {subjectList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>

                    {/* Faculty */}
                    {userData.role === 'admin' &&
                        (
                            <SideBarSection
                                icon={CiMenuKebab}
                                text='Faculty'
                            />
                        )}
                    <div>
                        {facultyList.map(tab => (
                            (tab.role === userData.role || userData.role === 'admin') &&
                            (
                                <SideBarTab
                                    key={tab.text}
                                    icon={tab.icon}
                                    to={tab.to}
                                    text={tab.text}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar