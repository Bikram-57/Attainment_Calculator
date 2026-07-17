import React, { useState } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { COLORS } from "../../constants/theme";
import { ErrorSuccessMsg } from "../index";

function AddRubricsForm({ setIsAddRubricsOpen, toggleUpdate }) {
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        course: "",
        year: "",
        thresholds: [
            { level: 0, minPercent: "", maxPercent: "" },
            { level: 1, minPercent: "", maxPercent: "" },
            { level: 2, minPercent: "", maxPercent: "" },
            { level: 3, minPercent: "", maxPercent: "" }
        ]
    });

    const [loading, setLoading] = useState(false);

    const handleThresholdChange = (index, field, value) => {
        const updated = [...formData.thresholds];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setFormData(prev => ({
            ...prev,
            thresholds: updated
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                course: formData.course,
                year: Number(formData.year),
                thresholds: formData.thresholds.map(item => ({
                    level: item.level,
                    minPercent: Number(item.minPercent),
                    maxPercent: Number(item.maxPercent)
                }))
            };

            const res = await axios.post("/rubrics/upload", payload);
            setSuccessMsg(res.data.message);
            toggleUpdate();
        } catch (error) {
            setErrorMsg(error?.response?.data?.message);
            console.error(
                "Axios Error | AddRubricsForm | handleSubmit(): ",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddRubricsOpen(false)}
        >
            <div
                className="w-[90%] max-w-2xl rounded-xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b border-black/10"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Add Rubrics
                    </h2>

                    <button
                        onClick={() => setIsAddRubricsOpen(false)}
                        className="rounded-md p-1 transition hover:bg-white/10 cursor-pointer"
                    >
                        <IoMdClose
                            className="h-6 w-6"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5">

                    {/* Course + Year */}
                    <div className="grid grid-cols-2 gap-4 mb-5">

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Course
                            </label>

                            <input
                                type="text"
                                value={formData.course}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        course: e.target.value.toUpperCase(),
                                    }))
                                }
                                placeholder="Course"
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Academic Year
                            </label>

                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        year: e.target.value,
                                    }))
                                }
                                placeholder="Year"
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                    </div>

                    {/* Threshold Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

                        <table className="w-full text-sm">

                            <thead
                                style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.font,
                                }}
                            >
                                <tr>
                                    <th className="px-3 py-2.5 font-semibold">
                                        Level
                                    </th>
                                    <th className="px-3 py-2.5 font-semibold">
                                        Min %
                                    </th>
                                    <th className="px-3 py-2.5 font-semibold">
                                        Max %
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {formData.thresholds.map((item, index) => (
                                    <tr
                                        key={item.level}
                                        className="border-t border-gray-200 even:bg-gray-50"
                                    >
                                        <td className="px-3 py-2.5 text-center font-medium text-slate-700">
                                            Level {item.level}
                                        </td>

                                        <td className="px-3 py-2.5">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                value={item.minPercent}
                                                onChange={(e) =>
                                                    handleThresholdChange(
                                                        index,
                                                        "minPercent",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-center outline-none focus:border-gray-400"
                                            />
                                        </td>

                                        <td className="px-3 py-2.5">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                value={item.maxPercent}
                                                onChange={(e) =>
                                                    handleThresholdChange(
                                                        index,
                                                        "maxPercent",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-center outline-none focus:border-gray-400"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                    <div className="mt-4">
                        <ErrorSuccessMsg
                            errorMsg={errorMsg}
                            successMsg={successMsg}
                            setSuccessMsg={setSuccessMsg}
                            close={setIsAddRubricsOpen}
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={() => setIsAddRubricsOpen(false)}
                            className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-600 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
                            style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.font,
                            }}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>

                    </div>

                </form>
            </div>
        </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        //     onClick={() => setIsAddRubricsOpen(false)}
        // >
        //     <div
        //         className="w-[92%] max-w-3xl overflow-hidden rounded-2xl border border-gray-200 shadow-2xl"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >

        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between border-b border-gray-200 px-6 py-4"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <div>
        //                 <h2
        //                     className="text-xl font-semibold"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Add Rubrics
        //                 </h2>

        //                 <p
        //                     className="mt-1 text-sm opacity-90"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Configure attainment thresholds for each rubric level.
        //                 </p>
        //             </div>

        //             <button
        //                 onClick={() => setIsAddRubricsOpen(false)}
        //                 className="rounded-lg p-1 transition hover:bg-white/10 cursor-pointer"
        //             >
        //                 <IoMdClose
        //                     className="h-6 w-6"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>
        //         </div>

        //         {/* Form */}
        //         <form onSubmit={handleSubmit} className="p-6 space-y-6">

        //             {/* Basic Details */}
        //             <div className="rounded-xl border border-gray-200 bg-gray-100 p-5">

        //                 <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
        //                     Basic Information
        //                 </h3>

        //                 <div className="grid grid-cols-2 gap-5">

        //                     <div>
        //                         <label className="mb-2 block text-sm font-semibold text-gray-700">
        //                             Course
        //                         </label>

        //                         <input
        //                             type="text"
        //                             value={formData.course}
        //                             onChange={(e) =>
        //                                 setFormData(prev => ({
        //                                     ...prev,
        //                                     course: e.target.value.toUpperCase()
        //                                 }))
        //                             }
        //                             placeholder="e.g. BTECH"
        //                             className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        //                             required
        //                         />
        //                     </div>

        //                     <div>
        //                         <label className="mb-2 block text-sm font-semibold text-gray-700">
        //                             Academic Year
        //                         </label>

        //                         <input
        //                             type="number"
        //                             value={formData.year}
        //                             onChange={(e) =>
        //                                 setFormData(prev => ({
        //                                     ...prev,
        //                                     year: e.target.value
        //                                 }))
        //                             }
        //                             placeholder="e.g. 2026"
        //                             className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        //                             required
        //                         />
        //                     </div>

        //                 </div>

        //             </div>

        //             {/* Thresholds */}
        //             <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        //                 <div
        //                     className="px-5 py-3 font-semibold"
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font,
        //                     }}
        //                 >
        //                     Rubric Thresholds
        //                 </div>

        //                 <table className="w-full text-sm">

        //                     <thead className="bg-gray-100">

        //                         <tr>

        //                             <th className="border-b border-gray-200 px-4 py-3">
        //                                 Level
        //                             </th>

        //                             <th className="border-b border-gray-200 px-4 py-3">
        //                                 Minimum %
        //                             </th>

        //                             <th className="border-b border-gray-200 px-4 py-3">
        //                                 Maximum %
        //                             </th>

        //                         </tr>

        //                     </thead>

        //                     <tbody>

        //                         {formData.thresholds.map((item, index) => (
        //                             <tr
        //                                 key={item.level}
        //                                 className={`${index % 2 === 0
        //                                         ? "bg-white"
        //                                         : "bg-gray-50"
        //                                     } hover:bg-gray-100 transition`}
        //                             >

        //                                 <td className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">
        //                                     Level {item.level}
        //                                 </td>

        //                                 <td className="border-b border-gray-200 px-4 py-3">
        //                                     <input
        //                                         type="number"
        //                                         step="0.01"
        //                                         min={0}
        //                                         max={100}
        //                                         value={item.minPercent}
        //                                         onChange={(e) =>
        //                                             handleThresholdChange(
        //                                                 index,
        //                                                 "minPercent",
        //                                                 e.target.value
        //                                             )
        //                                         }
        //                                         className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center outline-none focus:border-gray-400"
        //                                         required
        //                                     />
        //                                 </td>

        //                                 <td className="border-b border-gray-200 px-4 py-3">
        //                                     <input
        //                                         type="number"
        //                                         step="0.01"
        //                                         min={0}
        //                                         max={100}
        //                                         value={item.maxPercent}
        //                                         onChange={(e) =>
        //                                             handleThresholdChange(
        //                                                 index,
        //                                                 "maxPercent",
        //                                                 e.target.value
        //                                             )
        //                                         }
        //                                         className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center outline-none focus:border-gray-400"
        //                                         required
        //                                     />
        //                                 </td>

        //                             </tr>
        //                         ))}

        //                     </tbody>

        //                 </table>

        //             </div>

        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 close={setIsAddRubricsOpen}
        //             />

        //             {/* Footer */}
        //             <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

        //                 <button
        //                     type="button"
        //                     onClick={() => setIsAddRubricsOpen(false)}
        //                     className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        //                 >
        //                     Cancel
        //                 </button>

        //                 <button
        //                     type="submit"
        //                     disabled={loading}
        //                     className="rounded-lg px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font,
        //                     }}
        //                 >
        //                     {loading ? "Saving..." : "Save Rubrics"}
        //                 </button>

        //             </div>

        //         </form>

        //     </div>
        // </div>

        // <div
        //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        //     onClick={() => setIsAddRubricsOpen(false)}
        // >
        //     <div
        //         className="w-[90%] max-w-3xl rounded-lg bg-white shadow-2xl overflow-hidden"
        //         style={{ backgroundColor: COLORS.latte }}
        //         onClick={(e) => e.stopPropagation()}
        //     >
        //         {/* Header */}
        //         <div
        //             className="flex items-center justify-between px-6 py-5 border-b"
        //             style={{ backgroundColor: COLORS.mint }}
        //         >
        //             <h2
        //                 className="text-2xl font-semibold"
        //                 style={{ color: COLORS.font }}
        //             >
        //                 Add Rubrics
        //             </h2>

        //             <button onClick={() => setIsAddRubricsOpen(false)}>
        //                 <IoMdClose
        //                     className="w-8 h-8 cursor-pointer"
        //                     style={{ color: COLORS.font }}
        //                 />
        //             </button>
        //         </div>

        //         {/* Form */}
        //         <form onSubmit={handleSubmit} className="p-6">

        //             {/* Course + Year */}
        //             <div className="grid grid-cols-2 gap-4 mb-6">
        //                 <div>
        //                     <label className="block mb-2 font-medium">
        //                         Course
        //                     </label>

        //                     <input
        //                         type="text"
        //                         value={formData.course}
        //                         onChange={(e) =>
        //                             setFormData(prev => ({
        //                                 ...prev,
        //                                 course: e.target.value.toUpperCase()
        //                             }))
        //                         }
        //                         className="w-full border rounded px-3 py-2"
        //                         placeholder="Enter course"
        //                         required
        //                     />
        //                 </div>

        //                 <div>
        //                     <label className="block mb-2 font-medium">
        //                         Academic Year
        //                     </label>

        //                     <input
        //                         type="number"
        //                         value={formData.year}
        //                         onChange={(e) =>
        //                             setFormData(prev => ({
        //                                 ...prev,
        //                                 year: e.target.value
        //                             }))
        //                         }
        //                         className="w-full border rounded px-3 py-2"
        //                         placeholder="Enter academic year"
        //                         required
        //                     />
        //                 </div>
        //             </div>

        //             {/* Threshold Table */}
        //             <table className="w-full border-collapse">
        //                 <thead
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font
        //                     }}
        //                 >
        //                     <tr>
        //                         <th className="px-4 py-3">Level</th>
        //                         <th className="px-4 py-3">Min %</th>
        //                         <th className="px-4 py-3">Max %</th>
        //                     </tr>
        //                 </thead>

        //                 <tbody>
        //                     {formData.thresholds.map((item, index) => (
        //                         <tr
        //                             key={item.level}
        //                             className="border-b"
        //                         >
        //                             <td className="px-4 py-4 text-center font-medium">
        //                                 Level {item.level}
        //                             </td>

        //                             <td className="px-4 py-4">
        //                                 <input
        //                                     type="number"
        //                                     step="0.01"
        //                                     min={0}
        //                                     max={100}
        //                                     value={item.minPercent}
        //                                     onChange={(e) =>
        //                                         handleThresholdChange(
        //                                             index,
        //                                             "minPercent",
        //                                             e.target.value
        //                                         )
        //                                     }
        //                                     className="w-full border rounded px-3 py-2"
        //                                     required
        //                                 />
        //                             </td>

        //                             <td className="px-4 py-4">
        //                                 <input
        //                                     type="number"
        //                                     step="0.01"
        //                                     min={0}
        //                                     max={100}
        //                                     value={item.maxPercent}
        //                                     onChange={(e) =>
        //                                         handleThresholdChange(
        //                                             index,
        //                                             "maxPercent",
        //                                             e.target.value
        //                                         )
        //                                     }
        //                                     className="w-full border rounded px-3 py-2"
        //                                     required
        //                                 />
        //                             </td>
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>

        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 close={setIsAddRubricsOpen}
        //             />

        //             {/* Footer */}
        //             <div className="flex justify-end gap-3 mt-6">
        //                 <button
        //                     type="button"
        //                     onClick={() => setIsAddRubricsOpen(false)}
        //                     className="bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                     style={{ color: COLORS.font }}
        //                 >
        //                     Cancel
        //                 </button>

        //                 <button
        //                     type="submit"
        //                     disabled={loading}
        //                     className="px-4 py-1 rounded-lg text-lg font-medium cursor-pointer"
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font
        //                     }}
        //                 >
        //                     {loading ? "Saving..." : "Save"}
        //                 </button>
        //             </div>
        //         </form>
        //     </div>
        // </div>
    );
}

export default AddRubricsForm;