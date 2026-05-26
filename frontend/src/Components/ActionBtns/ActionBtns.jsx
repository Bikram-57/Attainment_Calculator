// import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { SlOptions } from 'react-icons/sl';
// import DeleteModal from './DeleteModal';
// import EditModal from './EditModal';

// function ActionBtns({toggleUpdate, data, }) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [isDeleteOpen, setIsDeleteOpen] = useState(false)
//     const [isEditOpen, setIsEditOpen] = useState(false);
//     const ref = useRef();

// 	const deleteUser = async (e) => {
//         e.stopPropagation();
// 		try {
// 			const response = await axios.delete(`/user/${data.facultyId}`);			
// 			toggleUpdate(prev => !prev);
// 		} catch (error) {
// 			console.log('Axios Error | deleteUser(): ', error);
// 		}
//         setIsDeleteOpen(false);
//         setIsOpen(false);
//         alert('Faculty deleted successfully!');
// 	}

//     const closeMenu = (e) => {
//         e.stopPropagation();
//         setIsEditOpen(false);
//         setIsDeleteOpen(false);
//         setIsOpen(false);
//     }

//     useEffect(() => {
//         const close = (e) => !ref.current?.contains(e.target) && setIsOpen(false);
//         document.addEventListener('mousedown', close);
//         return () => document.removeEventListener('mousedown', close);
//     }, [])

//     return (
//         <div
//             className='cursor-pointer relative inline-block'
//             onClick={() => setIsOpen(prev => !prev)}
//             ref={ref}
//         >
//             <SlOptions className='cursor-pointer' />
//             {isOpen && (
//                 <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-30 text-center bg-white border rounded shadow z-10">
//                     <p className="px-4 py-1 hover:bg-gray-100 cursor-pointer">View</p>
//                     <p
//                         className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
//                         onClick={() => setIsEditOpen(true)}
//                     >
//                         Edit
//                     </p>
//                     <p
//                         className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
//                         onClick={() => setIsDeleteOpen(true)}
//                     >
//                         Delete
//                     </p>
//                 </div>
//             )}
//             {isDeleteOpen && (
//                 <DeleteModal onDelete={deleteUser} onClose={closeMenu}/>
//             )}
//             {isEditOpen && (
//                 <EditModal onClose={closeMenu}/>
//             )}
//         </div>
//     )
// }

// export default ActionBtns


function ActionBtns({ facultyId, toggleUpdate, ViewModal, EditModal, DeleteModal }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const ref = useRef()

    const closeMenu = () => {
        // e?.stopPropagation();
        setViewOpen(false);
        setEditOpen(false);
        setDeleteOpen(false);
        setIsOpen(false);
    }

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current?.contains(e.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div
            className='cursor-pointer relative inline-block'
            onClick={() => setIsOpen(prev => !prev)}
            ref={ref}
        >
            <SlOptions className='cursor-pointer' />
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-30 text-center bg-white border rounded shadow z-10">
                    <p
                        className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setViewOpen(true)}
                    >
                        View
                    </p>
                    <p
                        className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setEditOpen(true)}
                    >
                        Edit
                    </p>
                    <p
                        className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Delete
                    </p>
                </div>
            )}

            {viewOpen && (
                <ViewModal />
            )}

            {editOpen && (
                <EditModal onClose={closeMenu} />
            )}

            {deleteOpen && (
                <DeleteModal
                    facultyId={facultyId}
                    toggleUpdate={toggleUpdate}
                    closeMenu={closeMenu}
                />
            )}
        </div>
    )
}

export default ActionBtns