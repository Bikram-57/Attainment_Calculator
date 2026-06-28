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
                className="w-[90%] max-w-3xl rounded-lg bg-white shadow-2xl overflow-hidden"
                style={{ backgroundColor: COLORS.latte }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-5 border-b"
                    style={{ backgroundColor: COLORS.mint }}
                >
                    <h2
                        className="text-2xl font-semibold"
                        style={{ color: COLORS.font }}
                    >
                        Add Rubrics
                    </h2>

                    <button onClick={() => setIsAddRubricsOpen(false)}>
                        <IoMdClose
                            className="w-8 h-8 cursor-pointer"
                            style={{ color: COLORS.font }}
                        />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">

                    {/* Course + Year */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block mb-2 font-medium">
                                Course
                            </label>

                            <input
                                type="text"
                                value={formData.course}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        course: e.target.value.toUpperCase()
                                    }))
                                }
                                className="w-full border rounded px-3 py-2"
                                placeholder="Enter course"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">
                                Academic Year
                            </label>

                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        year: e.target.value
                                    }))
                                }
                                className="w-full border rounded px-3 py-2"
                                placeholder="Enter academic year"
                                required
                            />
                        </div>
                    </div>

                    {/* Threshold Table */}
                    <table className="w-full border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Min %</th>
                                <th className="px-4 py-3">Max %</th>
                            </tr>
                        </thead>

                        <tbody>
                            {formData.thresholds.map((item, index) => (
                                <tr
                                    key={item.level}
                                    className="border-b"
                                >
                                    <td className="px-4 py-4 text-center font-medium">
                                        Level {item.level}
                                    </td>

                                    <td className="px-4 py-4">
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
                                            className="w-full border rounded px-3 py-2"
                                            required
                                        />
                                    </td>

                                    <td className="px-4 py-4">
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
                                            className="w-full border rounded px-3 py-2"
                                            required
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <ErrorSuccessMsg
                        errorMsg={errorMsg}
                        successMsg={successMsg}
                        setSuccessMsg={setSuccessMsg}
                        close={setIsAddRubricsOpen}
                    />

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddRubricsOpen(false)}
                            className="px-5 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddRubricsForm;