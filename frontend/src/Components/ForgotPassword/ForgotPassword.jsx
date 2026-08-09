import axios from "axios";
import { useState } from "react";
import { ErrorSuccessMsg, Loading, ResetPassword, VerifyOtp } from '../index'

export default function ForgotPassword({ mode }) {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Enter your email to receive a verification code.');
    const [openForgotPassword, setOpenForgotPassword] = useState(true);
    const [resetToken, setResetToken] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/forgot-password/request/', {
                email
            });
            setMessage(res.data.message);
            setOtpSent(true);
        } catch (error) {
            setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to send OTP!');
            console.log('ERROR || ForgotPassword | handleSendOtp(): ', error);
        } finally {
            setLoading(false);
        }
    };

    return openForgotPassword ? (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {mode === 'forgot' ? 'Forgot Password' : 'Change Password'}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {message}
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                disabled={otpSent}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
                            />

                            {!otpSent && (
                                <button
                                    onClick={handleSendOtp}
                                    className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700"
                                >
                                    {!loading ? 'Send OTP' : <Loading type='forgot-password' h='6' w='6' />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* OTP Section */}
                    {otpSent && (
                        <VerifyOtp
                            email={email}
                            handleSendOtp={handleSendOtp}
                            setErrorMsg={setErrorMsg}
                            setSuccessMsg={setSuccessMsg}
                            setResetToken={setResetToken}
                        />
                    )}
                </div>
                <ErrorSuccessMsg
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                    setSuccessMsg={setSuccessMsg}
                    setIsOpen={setOpenForgotPassword}
                />
            </div>
        </div>

        // <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        //     <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        //         <div className="mb-8 text-center">
        //             <h1 className="text-3xl font-bold text-slate-900">
        //                 {mode === 'forgot' ? 'Forgot Password' : 'Change Password'}
        //             </h1>
        //             <p className="mt-2 text-sm text-slate-500">
        //                 {message}
        //             </p>
        //         </div>

        //         <div className="space-y-5">
        //             {/* Email Input */}
        //             <div>
        //                 <label className="mb-2 block text-sm font-medium text-slate-700">
        //                     Email Address
        //                 </label>

        //                 <div className="flex gap-2">
        //                     <input
        //                         type="email"
        //                         placeholder="john@example.com"
        //                         value={email}
        //                         disabled={otpSent}
        //                         onChange={(e) => setEmail(e.target.value)}
        //                         className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
        //                     />

        //                     {!otpSent && (
        //                         <button
        //                             onClick={handleSendOtp}
        //                             className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700"
        //                         >
        //                             {!loading ? 'Send OTP' : <Loading type='forgot-password' h='6' w='6' />}
        //                         </button>
        //                     )}
        //                 </div>
        //             </div>

        //             {/* OTP Section */}
        //             {otpSent && (
        //                 <VerifyOtp
        //                     email={email}
        //                     handleSendOtp={handleSendOtp}
        //                     setErrorMsg={setErrorMsg}
        //                     setSuccessMsg={setSuccessMsg}
        //                     setResetToken={setResetToken}
        //                 />
        //             )}
        //         </div>
        //         <ErrorSuccessMsg
        //             errorMsg={errorMsg}
        //             successMsg={successMsg}
        //             setSuccessMsg={setSuccessMsg}
        //             setIsOpen={setOpenForgotPassword}
        //         />
        //     </div>
        // </div>
    ) : (
        <ResetPassword resetToken={resetToken} />
    );
}