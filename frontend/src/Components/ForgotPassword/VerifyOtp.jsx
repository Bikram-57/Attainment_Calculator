import axios from 'axios';
import React from 'react'
import { useState, useEffect } from "react";

function VerifyOtp({ email, handleSendOtp, setErrorMsg, setSuccessMsg, setResetToken }) {
	const [otp, setOtp] = useState("");
	const [timeLeft, setTimeLeft] = useState(600);

	const handleVerifyOtp = async () => {
		if (timeLeft <= 0) {
			setErrorMsg('OTP has expired. Please request a new one.');
			return;
		}

		try {
			const res = await axios.post('/forgot-password/verify/', {
				email,
				otp
			});
			setSuccessMsg(res.data.message);
			setResetToken(res.data.resetToken);
		} catch (error) {
			setErrorMsg(error.response?.data?.message || "Something went wrong");
			// console.log('ERROR || ForgotPassword | handleVerifyOtp(): ', error);
		}
	};

	const handleResendOtp = () => {
		setTimeLeft(600);
		handleSendOtp();
	}
	
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;

		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	useEffect(() => {
		if (!timeLeft) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLeft]);

	return (
		<div className="animate-in fade-in slide-in-from-top-2 space-y-4 duration-300">
			<div>
				<label className="mb-2 block text-sm font-medium text-slate-700">
					Verification Code
				</label>
				<span
					className={`text-sm font-medium ${timeLeft <= 60
							? "text-red-500"
							: "text-slate-500"
						}`}
				>
					{formatTime(timeLeft)}
				</span>
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
				disabled={timeLeft <= 0}
				className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
			>
				{timeLeft > 0 ? 'Verify OTP' : 'OTP Expired'}
			</button>

			<button
				onClick={handleResendOtp}
				className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700"
			>
				Resend OTP
			</button>
		</div>
	)
}

export default VerifyOtp