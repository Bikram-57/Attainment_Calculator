import { useState } from "react";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import { COLORS } from "../../constants/theme";

function DownloadFormat() {
    const [downloadFormat, setDownloadFormat] = useState(null);

    const formatOptions = [
        {
            value: "internal",
            label: "Internal Marks",
        },
        {
            value: "external",
            label: "External Marks",
        },
    ];

    const handleFormatChange = (selected) => {
        setDownloadFormat(selected);
    };

    const handleDownload = async () => {
        if (!downloadFormat) return;

        try {
            const response = await axios.get(`/download-format/${downloadFormat.value}`,
                {
                    responseType: 'blob',
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${downloadFormat.value}_marks_format.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.log(err?.response?.data?.message || err?.response?.data?.error || 'Failed to download format.');
            console.error('Download failed:', err);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Download Format
            </label>

            <div className="w-50">
                <Select
                    options={formatOptions}
                    value={downloadFormat}
                    onChange={handleFormatChange}
                    placeholder="Select format"
                    isClearable
                />
            </div>

            {downloadFormat && (
                <button
                    type="button"
                    onClick={handleDownload}
                    title={`Download ${downloadFormat.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition cursor-pointer"
                    style={{
                        backgroundColor: COLORS.mint
                    }}
                >
                    <FaDownload size={17} />
                </button>
            )}
        </div>
    );
}

export default DownloadFormat;