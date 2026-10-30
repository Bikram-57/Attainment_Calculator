// import { useState } from "react";
// import Select from "react-select";
// import { FaDownload } from "react-icons/fa";
// import axios from "axios";
// import { COLORS } from "../../constants/theme";
// import useFileDownload from '../../hooks/useFileDownload';

// function DownloadFormat() {
//     const [downloadFormat, setDownloadFormat] = useState(null);

//     const formatOptions = [
//         {
//             value: "internal",
//             label: "Internal Marks",
//         },
//         {
//             value: "external",
//             label: "External Marks",
//         },
//     ];

//     const handleFormatChange = (selected) => {
//         setDownloadFormat(selected);
//     };

//     const handleDownload = async () => {
//         if (!downloadFormat) return;

//         try {
//             const response = await axios.get(`/download-format/${downloadFormat.value}`,
//                 {
//                     responseType: 'blob',
//                 }
//             );

//             useFileDownload(
//                 response.data,
//                 `${downloadFormat.value}_marks_format.xlsx`
//             )

//             // const blob = new Blob([response.data]);
//             // const url = window.URL.createObjectURL(blob);

//             // const link = document.createElement('a');
//             // link.href = url;
//             // link.download = `${downloadFormat.value}_marks_format.xlsx`;

//             // document.body.appendChild(link);
//             // link.click();
//             // link.remove();
//             // window.URL.revokeObjectURL(url);

//         } catch (err) {
//             console.log(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download format.');
//             console.error('Download failed:', err);
//         }
//     };

//     return (
//         <div className="flex items-center gap-3">
//             <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
//                 Download Format
//             </label>

//             <div className="w-50">
//                 <Select
//                     options={formatOptions}
//                     value={downloadFormat}
//                     onChange={handleFormatChange}
//                     placeholder="Select format"
//                     isClearable
//                 />
//             </div>

//             {downloadFormat && (
//                 <button
//                     type="button"
//                     onClick={handleDownload}
//                     title={`Download ${downloadFormat.label}`}
//                     className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition cursor-pointer"
//                     style={{
//                         backgroundColor: COLORS.mint
//                     }}
//                 >
//                     <FaDownload size={17} />
//                 </button>
//             )}
//         </div>
//     );
// }

// export default DownloadFormat;








import React, { useState, useEffect, useRef } from "react";
import { FaFileExcel } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import axios from "axios";
import useFileDownload from '../../hooks/useFileDownload';

function DownloadFormat() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const dropdownRef = useRef(null);

    // Handle clicks outside the dropdown to close it automatically
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownload = async (format) => {
        setIsDropdownOpen(false); // Close dropdown immediately upon selection
        if (downloading) return;

        try {
            setDownloading(true);
            const response = await axios.get(`/download-format/${format}`, {
                responseType: 'blob',
            });

            useFileDownload(
                response.data,
                `${format}_marks_format.xlsx`
            );

        } catch (err) {
            console.log(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download format.');
            console.error('Download failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="relative z-40" ref={dropdownRef}>
            {/* Unified Dropdown Button */}
            <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                disabled={downloading}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-400 bg-gray-200 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:w-auto"
            >
                <div className="flex items-center gap-2">
                    <IoMdDownload className="text-lg" />
                    <span>{downloading ? "Downloading..." : "Download Format"}</span>
                </div>
                <IoChevronDown className={`ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    <button
                        onClick={() => handleDownload('internal')}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                    >
                        <FaFileExcel className="text-green-600 text-lg" />
                        <span>Internal Marks</span>
                    </button>
                    
                    <div className="h-px w-full bg-gray-100"></div> {/* Divider */}
                    
                    <button
                        onClick={() => handleDownload('external')}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                    >
                        <FaFileExcel className="text-green-600 text-lg" />
                        <span>External Marks</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default DownloadFormat;