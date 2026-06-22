import React, { useState } from 'react'
import { BsSearch } from 'react-icons/bs'
import { COLORS } from '../../constants/theme';
import GenerateAttainmentForm from './GenerateAttainmentForm';

function DirectAttainmentHeader({ toggleUpdate, setSearchQuery }) {
    const [search, setSearch] = useState('');
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

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
                Direct Attainment
            </div>

            <div className='flex gap-5 mx-10'>
                <div
                    className='border rounded-md flex items-center'
                >
                    <input
                        type='text'
                        placeholder='Search by course name or academic year'
                        value={search}
                        className='border-r px-3 py-1 w-87.5 outline-none'
                        style={{
                            color: COLORS.mintDark
                        }}
                        onChange={(e) => handleChange(e)}
                    />
                    <div
                        className='px-3 py-1 cursor-pointer'
                        onClick={() => setSearchQuery(search)}
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
                    onClick={() => setIsGenerateOpen(true)}
                    >
                        Generate Attainment
                    </button>
                </div>
            </div>
            {isGenerateOpen &&
                <GenerateAttainmentForm
                    setIsGenerateOpen={setIsGenerateOpen}
                    toggleUpdate={toggleUpdate}
                />
            }
        </div>
    )
}

export default DirectAttainmentHeader