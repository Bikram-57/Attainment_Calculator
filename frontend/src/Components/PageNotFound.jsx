import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoHomeSharp } from "react-icons/io5";
import { close, open } from "../store/sideBarSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { COLORS } from "../constants/theme";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function PageNotFound() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useDocumentTitle('Page Not Found')

    useEffect(() => {
        dispatch(close());
        return () => dispatch(open());
    }, [dispatch])
    return (
        <div
            className="flex min-h-screen items-center justify-center px-6 py-10"
            style={{ backgroundColor: COLORS.latteDark }}
        >
            <div
                className="w-full max-w-xl rounded-2xl border border-gray-200 p-10 text-center shadow-lg"
                style={{ backgroundColor: COLORS.latte }}
            >

                <div
                    className="text-7xl font-extrabold"
                    style={{ color: COLORS.mint }}
                >
                    404
                </div>

                <h2 className="mt-4 text-3xl font-bold text-slate-800">
                    Page Not Found
                </h2>

                <p className="mt-3 text-gray-600 leading-7">
                    The page you are looking for doesn't exist or may have been moved.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium shadow-sm transition hover:opacity-90 cursor-pointer"
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font,
                        }}
                    >
                        <IoHomeSharp size={18} />
                        Home
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 font-medium text-slate-700 transition hover:bg-gray-100 cursor-pointer"
                    >
                        <FaArrowLeft size={16} />
                        Go Back
                    </button>

                </div>

            </div>
        </div>


        // <div
        //     className="flex min-h-full items-center justify-center px-6 py-10"
        //     style={{
        //         background: "linear-gradient(135deg, #F6F4EF 0%, #EEF6F2 100%)",
        //     }}
        // >
        //     <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

        //         {/* Decorative Background */}
        //         <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-[#DCEEE6] opacity-50"></div>
        //         <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#EEF6F2] opacity-70"></div>

        //         <div className="relative px-10 py-14 text-center">

        //             {/* 404 */}
        //             <div
        //                 className="text-8xl font-extrabold tracking-tight"
        //                 style={{ color: COLORS.mint }}
        //             >
        //                 404
        //             </div>

        //             {/* Title */}
        //             <h2 className="mt-4 text-3xl font-bold text-slate-800">
        //                 Oops! Page Not Found
        //             </h2>

        //             {/* Description */}
        //             <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
        //                 The page you're looking for doesn't exist, may have been moved,
        //                 or the URL might be incorrect.
        //             </p>

        //             {/* Buttons */}
        //             <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

        //                 <button
        //                     onClick={() => navigate("/")}
        //                     className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-md transition hover:scale-[1.02] cursor-pointer"
        //                     style={{
        //                         backgroundColor: COLORS.mint,
        //                         color: COLORS.font,
        //                     }}
        //                 >
        //                     <IoHomeSharp size={18} />
        //                     Go to Dashboard
        //                 </button>

        //                 <button
        //                     onClick={() => navigate(-1)}
        //                     className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-gray-50 cursor-pointer"
        //                 >
        //                     <FaArrowLeft size={17} />
        //                     Go Back
        //                 </button>

        //             </div>

        //         </div>
        //     </div>
        // </div>


        // <div className="flex min-h-full items-center justify-center bg-slate-50 px-6">
        //     <div className="max-w-xl text-center">
        //         <h1 className="text-8xl font-extrabold text-slate-900">404</h1>

        //         <h2 className="mt-4 text-3xl font-bold text-slate-800">
        //             Page Not Found
        //         </h2>

        //         <p className="mt-4 text-lg text-slate-600">
        //             Sorry, the page you're looking for doesn't exist or may have been
        //             moved.
        //         </p>

        //         <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        //             <button
        //                 onClick={() => navigate("/")}
        //                 className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium transition cursor-pointer"
        //                 style={{
        //                     backgroundColor: COLORS.mint,
        //                     color: COLORS.font
        //                 }}
        //             >
        //                 <IoHomeSharp size={18} />
        //                 Go Home
        //             </button>

        //             <button
        //                 onClick={() => navigate(-1)}
        //                 className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        //             >
        //                 <FaArrowLeft size={18} />
        //                 Go Back
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}