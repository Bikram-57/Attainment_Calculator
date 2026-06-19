import React, { useEffect, useState } from 'react'
import { MdDone } from "react-icons/md";

function ErrorSuccessMsg({ errorMsg, successMsg, setSuccessMsg, setIsOpen, close }) {
	useEffect(() => {
		if (!successMsg) return;
		const timer = setTimeout(() => {
			setSuccessMsg("");
			if (setIsOpen) {
				setIsOpen(false)
			} else if (close) {
				close();
			} else {
				null;
			}
		}, 2000);
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