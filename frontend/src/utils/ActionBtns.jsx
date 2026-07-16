import React, { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

function ActionBtns({ data, toggleUpdate, ViewModal, EditModal, DeleteModal }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);

    const ref = useRef(null);

    const closeMenu = () => {
        setViewOpen(false);
        setEditOpen(false);
        setDeleteOpen(false);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleMenu = (e) => {
        e.stopPropagation();

        if (!isOpen && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            // Approximate menu height
            setOpenUpwards(spaceBelow < 150);
        }

        setIsOpen(prev => !prev);
    };

    return (
        <div className="relative inline-block" ref={ref}>

            <button
                onClick={handleToggleMenu}
                className="rounded-lg p-2 transition hover:bg-gray-100 cursor-pointer"
            >
                <FiMoreVertical className="text-gray-600" />
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 z-20 w-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg
                        ${openUpwards ? "bottom-full mb-1" : "top-full mt-1"}`}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewOpen(true);
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                        <FiEye />
                        View
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                        <FiEdit2 />
                        Edit
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteOpen(true);
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                        <FiTrash2 />
                        Delete
                    </button>
                </div>
            )}

            {viewOpen && (
                <ViewModal
                    data={data}
                    closeMenu={closeMenu}
                />
            )}

            {editOpen && (
                <EditModal
                    data={data}
                    toggleUpdate={toggleUpdate}
                    closeMenu={closeMenu}
                />
            )}

            {deleteOpen && (
                <DeleteModal
                    data={data}
                    toggleUpdate={toggleUpdate}
                    closeMenu={closeMenu}
                />
            )}

        </div>
    );
}

export default ActionBtns;
