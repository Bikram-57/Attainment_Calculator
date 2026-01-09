import React, { useState } from 'react'

function SideBar() {
    // const [show, setShow] = useState(true);
    
    return (
        // <div className={`w-[20%] h-screen bg-blue-200 ${!show ?  '-translate-x-full': 'translate-x-0'} overflow-auto transition-all duration-1000`}>
        <div className={`w-[20%] h-screen bg-blue-00`}>
            <div className='h-[60px] w-full p-2 flex justify-between items-center'>
                <div></div>
                <div className='text-xs font-bold text-blue-900' onClick={() => setShow(false)}>Student Performance Assessment for Outcome Based Education</div>
            </div>
            <div className='bg-gray-100 h-screen'>
                <div>
                    <div></div>
                    <div>Dashboard</div>
                </div>
                <div>
                    <div>
                        <div></div>
                        <div>Menu</div>
                    </div>
                    <div>
                        <div>
                            <div></div>
                            <div>Upload Data</div>
                        </div>
                        <div>
                            <div></div>
                            <div>Fetch Data</div>
                        </div>
                        <div>
                            <div></div>
                            <div>CO-PO Relation</div>
                        </div>
                        <div>
                            <div></div>
                            <div>Direct Attainment</div>
                        </div>
                    </div>
                    <div>
                        <div></div>
                        <div>Analysis</div>
                    </div>
                    <div>
                        <div></div>
                        <div>Subject Report</div>
                    </div>
                    <div>
                        <div></div>
                        <div>Subjects</div>
                    </div>
                    <div>
                        <div>
                            <div></div>
                            <div>Manage Subjects</div>
                        </div>
                        <div>
                            <div></div>
                            <div>Assign Subjects</div>
                        </div>
                    </div>
                    <div>
                        <div></div>
                        <div>Faculty</div>
                    </div>
                    <div>
                        <div></div>
                        <div>Manage Faculty</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar