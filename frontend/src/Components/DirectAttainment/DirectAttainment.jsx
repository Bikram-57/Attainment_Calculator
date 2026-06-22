import React, { useState } from 'react'
import axios from 'axios'
import { COLORS } from '../../constants/theme';
import ErrorSuccessMsg from '../ErrorSuccessMsg';
import Loading from '../Loading';
import DirectAttainmentTable from './DirectAttainmentTable';

function DirectAttainment() {
    const [data, setData] = useState([]);
    const [academicYear, setAcademicYear] = useState('')
    const [course, setCourse] = useState('')
    const [errorMsg, setErrorMsg] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearList = [2024];
    for (let year = yearList[0] + 1; year <= currentYear; year++) {
        yearList.push(year);
    }

    const handleSubmit = async () => {
        if (!academicYear || !course) {
            setErrorMsg("Please fill all the fields");
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get('/dir/', {
                params: {
                    course,
                    academicYear
                }
            });
            setData(res.data.data);
            setIsOpen(true);
            setAcademicYear('');
            setCourse('');
        } catch (err) {
            setErrorMsg("Something went wrong! Format error!");
            console.log("Error on handleSubmit || ", err);
        } finally {
            setLoading(false);
        }
    }

    return !isOpen ? (
        <div className='h-full flex flex-col p-4'>
            <div className='flex justify-between pb-4'>
                <div
                    className='text-xl font-semibold'
                    style={{ color: COLORS.mint }}
                >
                    Direct Attainment
                </div>
            </div>
            <div className='w-full flex gap-4'>
                <select
                    className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
                    style={{ backgroundColor: COLORS.font }}
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                >
                    <option value=''>Select a year</option>
                    {yearList.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <select
                    className='border border-gray-300 rounded-sm flex-1 px-2 py-1 outline-none'
                    style={{ backgroundColor: COLORS.font }}
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                >
                    <option value=''>Select a course</option>
                    <option value='BCA'>BCA</option>
                    <option value='MCA'>MCA</option>
                </select>
            </div>

            <div className='flex gap-5 my-7'>
                <div className='flex w-4/5 items-center'>
                    <button
                        className='w-1/3 rounded-sm p-1 cursor-pointer duration-200'
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint,
                            color: COLORS.font
                        }}
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                    {loading && <Loading type='submit' />}
                </div>
            </div>
            <ErrorSuccessMsg
                errorMsg={errorMsg}
            />
        </div>
    ) : (
        <DirectAttainmentTable
            data={data}
            setIsOpen={setIsOpen}
        />
    )
}

export default DirectAttainment