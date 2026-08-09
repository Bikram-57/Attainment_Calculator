import axios from "axios";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ErrorSuccessMsg } from "../index";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword({ resetToken }) {
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(true);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const passwordsMatch =
        newPassword && confirmNewPassword && newPassword === confirmNewPassword;

    const passwordStrength = () => {
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;

        return score;
    };

    const strength = passwordStrength();

    const getStrengthLabel = () => {
        if (strength <= 1) return "Weak";
        if (strength <= 3) return "Medium";
        return "Strong";
    };

    const handleResetPassword = async () => {
        if (!passwordsMatch) return;

        try {
            const res = await axios.post('/forgot-password/reset/', {
                newPassword,
                resetToken
            });
            setSuccessMsg(res.data.message)
        } catch (error) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to reset password!');
        }
    };

    useEffect(() => {
        if (!isResetPasswordOpen) {
            navigate('/login');
        }
    }, [isResetPasswordOpen]);

    return (
        <div className="space-y-5 sm:space-y-6">

            {/* New Password */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    New Password
                </label>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm sm:text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Password Strength */}
                {newPassword && (
                    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
                        <div className="mb-2 flex gap-1.5">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h - 1.5 flex - 1 rounded - full transition - colors duration - 200 ${strength >= level
                                            ? strength === 4
                                                ? "bg-green-500"
                                                : strength >= 3
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                            : "bg-slate-200"
                                        } `}
                                />
                            ))}
                        </div>

                        <p className="text-xs text-slate-500">
                            Password Strength:
                            <span className="ml-1 font-semibold text-slate-700">
                                {getStrengthLabel()}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                </label>

                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={`w - full rounded - xl border bg - white px - 4 py - 3 pr - 12 text - sm sm: text - base outline - none transition focus: ring - 2 ${confirmNewPassword
                                ? passwordsMatch
                                    ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                                    : "border-red-400 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
                            } `}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {confirmNewPassword && (
                    <div
                        className={`mt - 2 flex items - center gap - 1.5 text - xs sm: text - sm font - medium ${passwordsMatch
                                ? "text-green-600"
                                : "text-red-500"
                            } `}
                    >
                        <span>
                            {passwordsMatch ? "✓" : "✗"}
                        </span>

                        <span>
                            {passwordsMatch
                                ? "Passwords match"
                                : "Passwords do not match"}
                        </span>
                    </div>
                )}
            </div>

            {/* Reset Button */}
            <button
                onClick={handleResetPassword}
                disabled={!passwordsMatch}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm sm:text-base font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:hover:shadow-sm"
            >
                Reset Password
            </button>

            {/* Error / Success */}
            <ErrorSuccessMsg
                errorMsg={errorMsg}
                successMsg={successMsg}
                setSuccessMsg={setSuccessMsg}
                setIsOpen={setIsResetPasswordOpen}
            />

        </div>



        // <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        //     <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        //         <div className="mb-8 text-center">
        //             <h1 className="text-3xl font-bold text-slate-900">
        //                 Reset Password
        //             </h1>
        //             <p className="mt-2 text-sm text-slate-500">
        //                 Create a new password for your account.
        //             </p>
        //         </div>

        //         <div className="space-y-5">
        //             {/* New Password */}
        //             <div>
        //                 <label className="mb-2 block text-sm font-medium text-slate-700">
        //                     New Password
        //                 </label>

        //                 <div className="relative">
        //                     <input
        //                         type={showPassword ? "text" : "password"}
        //                         placeholder="Enter new password"
        //                         value={newPassword}
        //                         onChange={(e) => setNewPassword(e.target.value)}
        //                         className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        //                     />

        //                     <button
        //                         type="button"
        //                         onClick={() => setShowPassword(!showPassword)}
        //                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        //                     >
        //                         {showPassword ? <FaEyeSlash /> : <FaEye />}
        //                     </button>
        //                 </div>

        //                 {newPassword && (
        //                     <div className="mt-3">
        //                         <div className="mb-2 flex gap-1">
        //                             {[1, 2, 3, 4].map((level) => (
        //                                 <div
        //                                     key={level}
        //                                     className={`h-2 flex-1 rounded-full ${strength >= level
        //                                         ? "bg-green-500"
        //                                         : "bg-slate-200"
        //                                         }`}
        //                                 />
        //                             ))}
        //                         </div>

        //                         <p className="text-xs text-slate-500">
        //                             Password Strength:
        //                             <span className="ml-1 font-medium">
        //                                 {getStrengthLabel()}
        //                             </span>
        //                         </p>
        //                     </div>
        //                 )}
        //             </div>

        //             {/* Confirm Password */}
        //             <div>
        //                 <label className="mb-2 block text-sm font-medium text-slate-700">
        //                     Confirm Password
        //                 </label>

        //                 <div className="relative">
        //                     <input
        //                         type={showConfirmPassword ? "text" : "password"}
        //                         placeholder="Confirm new password"
        //                         value={confirmNewPassword}
        //                         onChange={(e) => setConfirmNewPassword(e.target.value)}
        //                         className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        //                     />

        //                     <button
        //                         type="button"
        //                         onClick={() =>
        //                             setShowConfirmPassword(!showConfirmPassword)
        //                         }
        //                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        //                     >
        //                         {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        //                     </button>
        //                 </div>

        //                 {confirmNewPassword && (
        //                     <p
        //                         className={`mt-2 text-sm ${passwordsMatch
        //                             ? "text-green-600"
        //                             : "text-red-500"
        //                             }`}
        //                     >
        //                         {passwordsMatch
        //                             ? "✓ Passwords match"
        //                             : "✗ Passwords do not match"}
        //                     </p>
        //                 )}
        //             </div>

        //             <button
        //                 onClick={handleResetPassword}
        //                 disabled={!passwordsMatch}
        //                 className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        //             >
        //                 Reset Password
        //             </button>
        //             <ErrorSuccessMsg
        //                 errorMsg={errorMsg}
        //                 successMsg={successMsg}
        //                 setSuccessMsg={setSuccessMsg}
        //                 setIsOpen={setIsResetPasswordOpen}
        //             />
        //         </div>
        //     </div>
        // </div>
    );
}