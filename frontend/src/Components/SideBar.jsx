import React, { useState } from 'react'
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

function SideBar({isOpen}) {

    return (
        // <div className={`w-[20% h-screen bg-blue-200 ${show ? 'w-[20%] translate-x-0' : 'w-0 -translate-x-full'} overflow-auto transition-all duration-1000`}>
        <div className={`h-screen bg-gray-50 ${isOpen ? 'w-[20%] translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 ease-in-out overflow-hidden`}>
            <div className='h-[60px] w-full p-2 flex gap-2 justify-between items-center text-blue-900 bg-white'>
                <FaGraduationCap className='text-5xl' />
                <div className='text-xs font-bold'>Student Performance Assessment for Outcome Based Education</div>
            </div>
            <div className='p-3 font-semibold text-lg'>
                <div className='flex items-center gap-1'>
                    <IoOptionsOutline />
                    <div>Dashboard</div>
                </div>
                <div className='my-4'>
                    <div className='flex items-center gap-1'>
                        <CiMenuKebab />
                        <div>Menu</div>
                    </div>
                    <div className='px-6'>
                        <div className='flex items-center gap-1 mt-4'>
                            <FaFileUpload />
                            <div>Upload Data</div>
                        </div>
                        <div className='flex items-center gap-1 mt-4'>
                            <FaFileDownload />
                            <div>Fetch Data</div>
                        </div>
                        <div className='flex items-center gap-1 mt-4'>
                            <IoMdCloudUpload />
                            <div>CO-PO Relation</div>
                        </div>
                        <div className='flex items-center gap-1 mt-4'>
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
                        <div className='flex items-center gap-1 px-6'>
                            <ImStatsBars2 />
                            <div>Manage Subjects</div>
                        </div>
                        <div className='flex items-center gap-1 px-6 my-4'>
                            <BsCardChecklist />
                            <div>Assign Subjects</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 my-4'>
                        <CiMenuKebab />
                        <div>Faculty</div>
                    </div>
                    <div className='flex items-center gap-1 px-6'>
                        <HiMiniUsers />
                        <div>Manage Faculty</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar