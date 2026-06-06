import React, { useState } from 'react'
import { BsSearch } from "react-icons/bs";
import AddFacultyForm from './AddFacultyForm';
import { COLORS } from '../../constants/theme';

function FacultyHeader({ toggleUpdate, setSearchQuery }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const handleChange = (e) => {
        if (e.target.value == '') {
            setSearchQuery('');
        }
        setSearch(e.target.value);
        setSearchQuery(e.target.value);
    }

    return (
        <div className='flex justify-between p-4'>
            <div
                className='text-xl font-semibold'
                style={{ color: COLORS.mint }}
            >
                List of Faculty
            </div>
            <div className='flex gap-5 mx-10'>
                <div
                    className='border rounded-md flex items-center'
                    // style={{ borderColor: COLORS.mintDark }}
                >
                    <input
                        type='text'
                        placeholder='Search by id or name'
                        value={search}
                        className='border-r px-3 py-1 w-62.5 outline-none'
                        style={{
                            // borderRightColor: COLORS.mintDark,
                            color: COLORS.mintDark
                        }}
                        onChange={(e) => handleChange(e)}
                    />
                    <div className='px-3 py-1 cursor-pointer'>
                        <BsSearch
                            onClick={() => setSearchQuery(search)}
                            style={{ color: COLORS.mint }}
                        />
                    </div>
                </div>
                <div>
                    <button
                        className='px-3 py-1 rounded-lg cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                        onClick={() => setIsOpen(true)}
                    >
                        Add Faculty
                    </button>
                </div>
            </div>
            {isOpen &&
                <AddFacultyForm
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default FacultyHeader