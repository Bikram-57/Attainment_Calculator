import axios from "axios";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const handleSendOtp = async() => {
        try {
            const res = await axios.post('/forgot-password/request/', {
                email
            });
            console.log(res);
            setOtpSent(true);
        } catch (error) {
            console.log('ERROR || Login | handleLogin(): ', error);
        }
    };

    const handleVerifyOtp = () => {
        // API call here
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Forgot Password
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Enter your email to receive a verification code.
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
                                    Send OTP
                                </button>
                            )}
                        </div>
                    </div>

                    {/* OTP Section */}
                    {otpSent && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-4 duration-300">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Verification Code
                                </label>

                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center tracking-[0.5em] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition hover:bg-green-700"
                            >
                                Verify OTP
                            </button>

                            <button
                                onClick={handleSendOtp}
                                className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                Resend OTP
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}