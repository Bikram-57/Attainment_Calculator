import { FaBookOpen, FaTasks, FaFileAlt, FaCheckCircle, FaClock, } from "react-icons/fa";

function Dashboard() {
    const stats = [
        {
            title: "Active Subjects",
            value: 12,
            icon: <FaBookOpen size={24} />,
            color: "border-blue-500",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pending Mappings",
            value: 3,
            subtitle: "Requires PO validation",
            icon: <FaTasks size={24} />,
            color: "border-yellow-500",
            bg: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: "Reports Generated",
            value: 48,
            icon: <FaFileAlt size={24} />,
            color: "border-green-500",
            bg: "bg-green-50",
            iconColor: "text-green-600",
        },
    ];

    const recentUploads = [
        {
            file: "CS101_Midterms.xlsx",
            status: "Parsed",
            success: true,
        },
        {
            file: "ME202_Quizzes.xlsx",
            status: "Parsed",
            success: true,
        },
        {
            file: "EE301_Final.xlsx",
            status: "Mapping",
            success: false,
        },
        {
            file: "MCA_2026_Sem2.xlsx",
            status: "Parsed",
            success: true,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <h1 className="mb-3 text-2xl font-bold text-slate-800">
                    Overview
                </h1>

                {/* Stat Cards */}
                <div className="mb-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stats.map((item) => (
                        <div
                            key={item.title}
                            className={`overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md`}
                        >
                            <div className={`h-2 ${item.color.replace("border-", "bg-")}`} />

                            <div className="p-3">
                                <div className="mb-4 flex items-center gap-4">
                                    <div
                                        className={`rounded-xl p-3 ${item.bg} ${item.iconColor}`}
                                    >
                                        {item.icon}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-5xl font-bold text-slate-900">
                                    {item.value}
                                </p>

                                {item.subtitle && (
                                    <p className="mt-2 text-sm text-slate-500">
                                        {item.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="border-b p-4">
                        <h2 className="text-2xl font-semibold text-slate-800">
                            Recent Activity
                        </h2>
                    </div>

                    <div className="divide-y">
                        {recentUploads.map((upload) => (
                            <div
                                key={upload.file}
                                className="flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <FaFileAlt className="text-slate-500" />

                                    <span className="font-medium text-slate-700">
                                        {upload.file}
                                    </span>
                                </div>

                                <span
                                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${upload.success
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {upload.success ? (
                                        <FaCheckCircle />
                                    ) : (
                                        <FaClock />
                                    )}
                                    {upload.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard