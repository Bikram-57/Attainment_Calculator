import React, { useEffect, useState } from 'react'
import { MdDone } from "react-icons/md";

function ErrorSuccessMsg({ errorMsg, successMsg, setSuccessMsg, setIsOpen }) {
	useEffect(() => {
		if (!successMsg) return;
		const timer = setTimeout(() => {
			setSuccessMsg("");
			setIsOpen(false);
		}, 3000);
		return () => clearTimeout(timer);
	}, [successMsg]);

	return (
		<div>
			{errorMsg && (
				<p className="text-red-500 text-sm ml-2">
					{errorMsg}
				</p>
			)}
			{successMsg && (
				<p className="text-sm ml-2 flex">
					<MdDone className='text-green-500 h-full w-5 mx-1 order rounded-full' />
					{successMsg}
				</p>
			)}
		</div>
	)
}

export default ErrorSuccessMsg