import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ErrorSuccessMsg } from './index'
import { COLORS } from "../constants/theme";

function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [isHovered, setIsHovered] = useState(false);

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
		} catch (err) {
			setErrorMsg(err?.response?.data?.message || err?.response?.data?.error || 'Something went wrong!');
			console.log('ERROR || Login | handleLogin(): ', err);
		}
	}

	return (
		<div
			className="min-h-screen flex items-center justify-center px-6 py-4"
			style={{
				background:
					"radial-gradient(circle at top left, #F7F2EA 0%, #EEF5F2 55%, #E3F0EA 100%)",
			}}
		>
			<div className="w-full max-w-6xl">

				{/* Heading */}
				<div className="mb-5 text-center">
					<h1
						className="text-4xl font-bold tracking-tight"
						style={{ color: COLORS.mintDark }}
					>
						Attainment Calculator
						{/* Student Performance Assessment
						<br />
						for Outcome Based Education */}
					</h1>

					<p className="mt-1 text-base text-gray-600">
						Outcome Based Education Management Portal
					</p>
				</div>

				{/* Login Card */}
				<div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.12)]">

					<div className="grid lg:grid-cols-2">

						{/* Left Panel */}
						<div className="hidden lg:flex bg-[#F8F5F0]">
							<div className="w-2 bg-[#8A0035]" />
							<div className="flex flex-1 flex-col items-center justify-center px-10">
								<img
									src="/Final-Logo-Edited.png"
									alt="SPAOBE"
									className="h-72 object-contain"
								/>
								<h2 className="mt-8 text-3xl font-bold text-[#8A0035]">
									Welcome Back
								</h2>
								<p className="mt-2 text-gray-500">
									Outcome Based Education Portal
								</p>
							</div>
						</div>

						{/* Right Panel */}
						<div className="flex items-center justify-center bg-[#FCFBF8] px-12 py-6">

							<form
								className="w-full max-w-md"
								onSubmit={(e) => {
									e.preventDefault();
									handleLogin();
								}}
							>
								<div className="mb-5">
									<h2
										className="text-2xl font-bold"
										style={{ color: COLORS.mintDark }}
									>
										Login
									</h2>

									<p className="mt-1 text-gray-500">
										Please sign in to continue.
									</p>
								</div>

								<div className="space-y-4">

									{/* Email */}
									<div>
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Email Address
										</label>

										<div className="flex items-center rounded-2xl border border-gray-200 bg-[#F8F8F8] transition-all focus-within:border-gray-400 focus-within:bg-white">
											<input
												type="text"
												value={email}
												placeholder="Enter your email"
												className="w-full bg-transparent px-5 py-4 outline-none rounded-l-2xl"
												onChange={(e) => setEmail(e.target.value)}
											/>

											<div
												className="px-5"
												style={{ color: COLORS.mint }}
											>
												<FaUser />
											</div>
										</div>
									</div>

									{/* Password */}
									<div>
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Password
										</label>

										<div className="flex items-center rounded-2xl border border-gray-200 bg-[#F8F8F8] transition-all focus-within:border-gray-400 focus-within:bg-white">
											<input
												type={showPassword ? "text" : "password"}
												value={password}
												placeholder="Enter your password"
												className="w-full bg-transparent px-5 py-4 outline-none rounded-l-2xl"
												onChange={(e) => setPassword(e.target.value)}
											/>

											<div
												className="px-5"
												style={{ color: COLORS.mint }}
											>
												<FaLock />
											</div>
										</div>
									</div>

									<div className="flex items-center justify-between">

										<label
											htmlFor="showPassword"
											className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
										>
											<input
												id="showPassword"
												type="checkbox"
												checked={showPassword}
												onChange={() =>
													setShowPassword(!showPassword)
												}
												className="h-4 w-4"
											/>

											Show Password
										</label>

										<NavLink
											to="/forgot-password"
											className="text-sm font-medium hover:underline"
											style={{ color: COLORS.mintDark }}
										>
											Forgot Password?
										</NavLink>

									</div>

									<button
										type="submit"
										className="mt-2 w-full rounded-2xl py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer"
										onMouseEnter={() => setIsHovered(true)}
										onMouseLeave={() => setIsHovered(false)}
										style={{
											backgroundColor: isHovered
												? COLORS.mintDark
												: COLORS.mint,
											color: COLORS.font,
										}}
									>
										Login
									</button>

									<div>
										<ErrorSuccessMsg errorMsg={errorMsg} />
									</div>

								</div>

							</form>

						</div>

					</div>

				</div>

				{/* Footer */}
				<div className="mt-6 text-center text-sm text-gray-500">
					Designed & Developed by{" "}
					<span className="font-semibold">
						Department of Computer Applications
					</span>
					<br />
					Sikkim Manipal Institute of Technology
				</div>

			</div>
		</div>

		// <div
		// 	className="min-h-screen flex items-center justify-center px-6 py-3"
		// 	style={{
		// 		background: "linear-gradient(135deg, #F6F4EF 0%, #E8F3EE 55%, #DCEEE6 100%)",
		// 	}}
		// >
		// 	<div className="w-full max-w-6xl">

		// 		{/* Heading */}
		// 		<div className="mb-3 text-center">
		// 			<h1
		// 				className="text-3xl font-bold leading-tight"
		// 				style={{ color: COLORS.mint }}
		// 			>
		// 				Student Performance Assessment
		// 				<br />
		// 				for Outcome Based Education
		// 			</h1>

		// 			<p className="mt-1 text-gray-600 text-lg">
		// 				Outcome Based Education Management Portal
		// 			</p>
		// 		</div>

		// 		{/* Login Card */}
		// 		<div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">

		// 			<div className="grid lg:grid-cols-2">

		// 				{/* Left Panel */}
		// 				<div
		// 					className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden p-10"
		// 					style={{
		// 						background: "linear-gradient(135deg, #F9F7F3 0%, #F2ECE3 100%)",
		// 					}}
		// 				>
		// 					{/* Decorative Background */}
		// 					<div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#8A0035]/6" />
		// 					<div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-[#8A0035]/5" />

		// 					<div className="absolute top-10 right-10 h-3 w-3 rounded-full bg-[#8A0035]/30" />
		// 					<div className="absolute bottom-16 left-12 h-2.5 w-2.5 rounded-full bg-[#8A0035]/25" />

		// 					{/* Logo */}
		// 					<img
		// 						src="/Final-Logo-Edited.png"
		// 						alt="SPAOBE"
		// 						className="relative z-10 h-72 object-contain drop-shadow-lg"
		// 					/>

		// 					{/* Welcome */}
		// 					<div className="relative z-10 mt-8 text-center">
		// 						<h2
		// 							className="text-3xl font-bold"
		// 							style={{ color: "#8A0035" }}
		// 						>
		// 							Welcome Back
		// 						</h2>

		// 						<p className="mt-2 text-gray-600">
		// 							Sign in to continue
		// 						</p>
		// 					</div>

		// 					{/* Bottom Accent */}
		// 					<div
		// 						className="absolute bottom-0 left-0 h-1.5 w-full"
		// 						style={{
		// 							background:
		// 								"linear-gradient(to right, #8A0035, #B10F4D, #8A0035)",
		// 						}}
		// 					/>
		// 				</div>
		// 				{/* <div
		// 					className="relative hidden lg:flex flex-col items-center justify-center p-4"
		// 					style={{
		// 						background: `linear-gradient(160deg, ${COLORS.mint} 0%, ${COLORS.mintDark} 100%)`,
		// 					}}
		// 				>
		// 					<div className="absolute inset-0 opacity-10">
		// 						<div className="absolute -left-16 -top-16 h-60 w-60 rounded-full bg-white"></div>
		// 						<div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white"></div>
		// 					</div>

		// 					<img
		// 						src="/Final-Logo-Edited.png"
		// 						alt="SPAOBE"
		// 						className="relative z-10 h-72 object-contain drop-shadow-xl"
		// 					/>

		// 					<h2 className="relative z-10 mt-8 text-3xl font-bold text-white">
		// 						Welcome Back!
		// 					</h2>

		// 					<p className="relative z-10 mt-3 max-w-sm text-center text-white/90 leading-relaxed">
		// 						Sign in to manage subjects, faculty, attainments,
		// 						reports and analytics.
		// 					</p>
		// 				</div> */}

		// 				{/* Right Panel */}
		// 				<div className="flex items-center justify-center bg-[#FCFBF8] px-10 py-12">

		// 					<form
		// 						className="w-full max-w-md"
		// 						onSubmit={(e) => {
		// 							e.preventDefault();
		// 							handleLogin();
		// 						}}
		// 					>
		// 						<div className="mb-4">
		// 							<h2
		// 								className="text-2xl font-bold"
		// 								style={{ color: COLORS.mint }}
		// 							>
		// 								Login
		// 							</h2>

		// 							<p className="mt-1 text-gray-500">
		// 								Enter your credentials to continue.
		// 							</p>
		// 						</div>

		// 						<div className="space-y-5">

		// 							{/* Email */}
		// 							<div>
		// 								<label className="mb-2 block text-sm font-medium text-gray-700">
		// 									Email
		// 								</label>

		// 								<div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white transition focus-within:border-gray-400">
		// 									<input
		// 										type="text"
		// 										value={email}
		// 										placeholder="Enter your email"
		// 										className="w-full bg-transparent px-4 py-3.5 outline-none"
		// 										onChange={(e) => setEmail(e.target.value)}
		// 									/>

		// 									<div
		// 										className="px-4"
		// 										style={{ color: COLORS.mint }}
		// 									>
		// 										<FaUser />
		// 									</div>
		// 								</div>
		// 							</div>

		// 							{/* Password */}
		// 							<div>
		// 								<label className="mb-2 block text-sm font-medium text-gray-700">
		// 									Password
		// 								</label>

		// 								<div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white transition focus-within:border-gray-400">
		// 									<input
		// 										type={showPassword ? "text" : "password"}
		// 										value={password}
		// 										placeholder="Enter your password"
		// 										className="w-full bg-transparent px-4 py-3.5 outline-none"
		// 										onChange={(e) => setPassword(e.target.value)}
		// 									/>

		// 									<div
		// 										className="px-4"
		// 										style={{ color: COLORS.mint }}
		// 									>
		// 										<FaLock />
		// 									</div>
		// 								</div>
		// 							</div>

		// 							<div className="flex items-center justify-between pt-1">

		// 								<label
		// 									htmlFor="showPassword"
		// 									className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
		// 								>
		// 									<input
		// 										id="showPassword"
		// 										type="checkbox"
		// 										checked={showPassword}
		// 										onChange={() =>
		// 											setShowPassword(!showPassword)
		// 										}
		// 										className="h-4 w-4"
		// 									/>
		// 									Show Password
		// 								</label>

		// 								<NavLink
		// 									to="/forgot-password"
		// 									className="text-sm font-medium hover:underline"
		// 									style={{ color: COLORS.mintDark }}
		// 								>
		// 									Forgot Password?
		// 								</NavLink>

		// 							</div>

		// 							<button
		// 								type="submit"
		// 								className="mt-2 w-full rounded-xl py-3.5 text-lg font-semibold shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer"
		// 								onMouseEnter={() => setIsHovered(true)}
		// 								onMouseLeave={() => setIsHovered(false)}
		// 								style={{
		// 									backgroundColor: isHovered
		// 										? COLORS.mintDark
		// 										: COLORS.mint,
		// 									color: COLORS.font,
		// 								}}
		// 							>
		// 								Login
		// 							</button>
		// 						</div>
		// 						<div className="mt-2">
		// 							<ErrorSuccessMsg
		// 								errorMsg={errorMsg}
		// 							/>
		// 						</div>
		// 					</form>

		// 				</div>

		// 			</div>

		// 		</div>

		// 		{/* Footer */}
		// 		<div className="mt-8 text-center text-sm text-gray-600">
		// 			Designed & Developed by{" "}
		// 			<span
		// 				className="font-semibold"
		// 				style={{ color: COLORS.mintDark }}
		// 			>
		// 				Department of Computer Applications
		// 			</span>
		// 			<br />
		// 			Sikkim Manipal Institute of Technology
		// 		</div>

		// 	</div>
		// </div>


		// <div className="min-h-screen bg-[#eef4fb] flex flex-col items-center px-4 py-6">
		// 	{/* Heading */}
		// 	<h1
		// 		className="mb-10 text-center text-4xl font-bold"
		// 		style={{ color: COLORS.mint }}
		// 	>
		// 		Student Performance Assessment for
		// 		<br />
		// 		Outcome Based Education
		// 	</h1>

		// 	{/* Login Card */}
		// 	<div className="w-full max-w-5xl rounded-xl bg-white shadow-xl">
		// 		<div className="grid min-h-112.5 md:grid-cols-2">
		// 			{/* Left Section */}
		// 			<div className="flex items-center justify-center p-10">
		// 				<img
		// 					// src="/education-vector.jpeg"
		// 					src="/Final-Logo.png"
		// 					alt="Login Illustration"
		// 					className="max-h-72 w-auto object-contain"
		// 				/>
		// 			</div>

		// 			{/* Right Section */}
		// 			<div className="flex items-center p-10">
		// 				<form
		// 					className="w-full max-w-md"
		// 					onSubmit={e => {
		// 						e.preventDefault();
		// 						handleLogin();
		// 					}}
		// 				>
		// 					<h2
		// 						className="mb-2 text-4xl font-bold"
		// 						style={{ color: COLORS.mint }}
		// 					>
		// 						Welcome Back!
		// 					</h2>

		// 					<p className="mb-4 text-gray-500">
		// 						Login to your account to continue
		// 					</p>


		// 					{/* Error Message */}
		// 					<ErrorSuccessMsg
		// 						errorMsg={errorMsg}
		// 					/>

		// 					<div className="mt-1 space-y-6">
		// 						{/* email */}
		// 						<div>
		// 							<div className="flex overflow-hidden rounded-lg border border-gray-300">
		// 								<input
		// 									type="text"
		// 									value={email}
		// 									placeholder="Email"
		// 									className="w-full px-4 py-3 outline-none"
		// 									onChange={(e) => setEmail(e.target.value)}
		// 								/>
		// 								<div
		// 									className="flex items-center border-l border-gray-300 px-4"
		// 									style={{ color: COLORS.mint }}
		// 								>
		// 									<FaUser />
		// 								</div>
		// 							</div>
		// 						</div>

		// 						{/* Password */}
		// 						<div>
		// 							<div className="flex overflow-hidden rounded-lg border border-gray-300">
		// 								<input
		// 									type={showPassword ? "text" : "password"}
		// 									value={password}
		// 									placeholder="Password"
		// 									className="w-full px-4 py-3 outline-none"
		// 									onChange={e => setPassword(e.target.value)}
		// 								/>
		// 								<div
		// 									className="flex items-center border-l border-gray-300 px-4"
		// 									style={{ color: COLORS.mint }}
		// 								>
		// 									<FaLock />
		// 								</div>
		// 							</div>
		// 						</div>

		// 						{/* Show Password */}
		// 						<div className="flex items-center gap-2">
		// 							<input
		// 								id="showPassword"
		// 								type="checkbox"
		// 								checked={showPassword}
		// 								onChange={() => setShowPassword(!showPassword)}
		// 								className="h-4 w-4"
		// 							/>
		// 							<label
		// 								htmlFor="showPassword"
		// 								className="cursor-pointer text-gray-700"
		// 							>
		// 								Show Password
		// 							</label>
		// 						</div>

		// 						{/* Login Button */}
		// 						<button
		// 							type="submit"
		// 							className="w-full rounded-lg py-3 font-semibold text-white transition cursor-pointer"
		// 							onMouseEnter={() => setIsHovered(true)}
		// 							onMouseLeave={() => setIsHovered(false)}
		// 							style={{ backgroundColor: isHovered ? COLORS.mintDark : COLORS.mint }}
		// 						>
		// 							Login
		// 						</button>

		// 						{/* Forgot Password */}
		// 						<div className="text-center">
		// 							<NavLink
		// 								to='/forgot-password'
		// 								className="text-[#35558d] hover:underline"
		// 							>
		// 								Forgot password?
		// 							</NavLink>
		// 						</div>
		// 					</div>
		// 				</form>
		// 			</div>
		// 		</div>
		// 	</div>

		// 	{/* Footer */}
		// 	<p className="mt-12 text-center text-lg text-gray-700">
		// 		Designed and developed by{" "}
		// 		<span className="text-[#35558d]">
		// 			Department of Computer Applications
		// 		</span>
		// 		, Sikkim Manipal Institute of Technology
		// 	</p>
		// </div>
	);
}

export default Login