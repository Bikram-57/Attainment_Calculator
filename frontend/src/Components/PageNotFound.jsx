import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoHomeSharp } from "react-icons/io5";
import { close, open } from "../store/sideBarSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { COLORS } from "../constants/theme";

export default function PageNotFound() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(close());
        return () => dispatch(open());
    }, [dispatch])
    return (
        <div className="flex min-h-full items-center justify-center bg-slate-50 px-6">
            <div className="max-w-xl text-center">
                <h1 className="text-8xl font-extrabold text-slate-900">404</h1>

                <h2 className="mt-4 text-3xl font-bold text-slate-800">
                    Page Not Found
                </h2>

                <p className="mt-4 text-lg text-slate-600">
                    Sorry, the page you're looking for doesn't exist or may have been
                    moved.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium transition cursor-pointer"
                        style={{
                            backgroundColor: COLORS.mint,
                            color: COLORS.font
                        }}
                    >
                        <IoHomeSharp size={18} />
                        Go Home
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        <FaArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}