import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ErrorSuccessMsg } from './index'

function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogin = async () => {
		if (!email || !password) {
			setErrorMsg('Please fill all the credentials!');
			return;
		}
		setErrorMsg('');
		try {
			const res = await axios.post('/login/', {
				email,
				password
			});

			axios.defaults.headers.common.Authorization =
				`Bearer ${res.data.accessToken}`;

			dispatch(
				login({
					userData: res.data.user,
					accessToken: res.data.accessToken
				})
			);
			navigate('/');
		} catch (error) {
			setErrorMsg(error?.response?.data?.message);
			console.log('ERROR || Login | handleLogin(): ', error);
		}
	}

	return (
		<div className="min-h-screen bg-[#eef4fb] flex flex-col items-center px-4 py-6">
			{/* Heading */}
			<h1 className="mb-10 text-center text-4xl font-bold text-[#35558d]">
				Student Performance Assessment for
				<br />
				Outcome Based Education
			</h1>

			{/* Login Card */}
			<div className="w-full max-w-5xl rounded-xl bg-white shadow-xl">
				<div className="grid min-h-112.5 md:grid-cols-2">
					{/* Left Section */}
					<div className="flex items-center justify-center p-10">
						<img
							// src="/education-vector.jpeg"
							src="/Final-Logo.png"
							alt="Login Illustration"
							className="max-h-72 w-auto object-contain"
						/>
					</div>

					{/* Right Section */}
					<div className="flex items-center p-10">
						<form
							className="w-full max-w-md"
							onSubmit={e => {
								e.preventDefault();
								handleLogin();
							}}
						>
							<h2 className="mb-2 text-4xl font-bold text-[#35558d]">
								Welcome Back!
							</h2>

							<p className="mb-4 text-gray-500">
								Login to your account to continue
							</p>


							{/* Error Message */}
							<ErrorSuccessMsg
								errorMsg={errorMsg}
							/>

							<div className="mt-1 space-y-6">
								{/* email */}
								<div>
									<div className="flex overflow-hidden rounded-lg border border-gray-300">
										<input
											type="text"
											value={email}
											placeholder="Email"
											className="w-full px-4 py-3 outline-none"
											onChange={(e) => setEmail(e.target.value)}
										/>
										<div className="flex items-center border-l border-gray-300 px-4 text-[#35558d]">
											<FaUser />
										</div>
									</div>
								</div>

								{/* Password */}
								<div>
									<div className="flex overflow-hidden rounded-lg border border-gray-300">
										<input
											type={showPassword ? "text" : "password"}
											value={password}
											placeholder="Password"
											className="w-full px-4 py-3 outline-none"
											onChange={e => setPassword(e.target.value)}
										/>
										<div className="flex items-center border-l border-gray-300 px-4 text-[#35558d]">
											<FaLock />
										</div>
									</div>
								</div>

								{/* Show Password */}
								<div className="flex items-center gap-2">
									<input
										id="showPassword"
										type="checkbox"
										checked={showPassword}
										onChange={() => setShowPassword(!showPassword)}
										className="h-4 w-4"
									/>
									<label
										htmlFor="showPassword"
										className="cursor-pointer text-gray-700"
									>
										Show Password
									</label>
								</div>

								{/* Login Button */}
								<button
									type="submit"
									className="w-full rounded-lg bg-[#35558d] py-3 font-semibold text-white transition hover:bg-[#2d4a7a]"
								>
									Login
								</button>

								{/* Forgot Password */}
								<div className="text-center">
									<NavLink
										to='/forgot-password'
										className="text-[#35558d] hover:underline"
									>
										Forgot password?
									</NavLink>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Footer */}
			<p className="mt-12 text-center text-lg text-gray-700">
				Designed and developed by{" "}
				<span className="text-[#35558d]">
					Department of Computer Applications
				</span>
				, Sikkim Manipal Institute of Technology
			</p>
		</div>
	);
}

export default Login