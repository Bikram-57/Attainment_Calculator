import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { COLORS } from '../../constants/theme';
import AddRubricsForm from './AddRubricsForm';

function RubricsHeader({ toggleUpdate}) {
    const [isAddRubricsOpen, setIsAddRubricsOpen ] = useState(false);
    return (
        <div className='flex justify-between p-4'>
            <div
                className='text-xl font-semibold'
                style={{ color: COLORS.mint }}
            >
                Rubrics
            </div>

            <div className='flex gap-5 mx-10'>
                <div
                    className='border rounded-md flex items-center'
                >
                    <input
                        type='text'
                        placeholder='Search by course name or academic year'
                        // value={search}
                        className='border-r px-3 py-1 w-87.5 outline-none'
                        style={{
                            color: COLORS.mintDark
                        }}
                        // onChange={(e) => handleChange(e)}
                    />
                    <div
                        className='px-3 py-1 cursor-pointer'
                        // onClick={() => setSearchQuery(search)}
                    >
                        <BsSearch style={{ color: COLORS.mintDark }} />
                    </div>
                </div>
                <div>
                    <button
                        className='px-3 py-1 rounded-lg cursor-pointer'
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                        onClick={() => setIsAddRubricsOpen(true)}
                    >
                        Add Rubrics
                    </button>
                </div>
            </div>
            {isAddRubricsOpen &&
                <AddRubricsForm
                    toggleUpdate={toggleUpdate}
                    setIsAddRubricsOpen={setIsAddRubricsOpen}
                />
            }
        </div>
    )
}

export default RubricsHeader