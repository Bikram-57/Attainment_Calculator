// export default function UnderDevelopment() {
//     return (
//         <div className="min-h-full flex items-center justify-center bg-slate-50 px-6">
//             <div className="max-w-lg text-center">
//                 <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-10 w-10 text-blue-600"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                     >
//                         <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M9.75 3v2.25m4.5-2.25v2.25M3 9.75h18M5.25 6.75h13.5A2.25 2.25 0 0121 9v9.75A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V9A2.25 2.25 0 015.25 6.75z"
//                         />
//                     </svg>
//                 </div>

//                 <h1 className="text-4xl font-bold text-slate-900">
//                     Page Under Development
//                 </h1>

//                 <p className="mt-4 text-lg text-slate-600">
//                     We're currently working on this page and it'll be available soon.
//                 </p>

//                 <div className="mt-8">
//                     <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
//                         🚧 Coming Soon
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }


export default function UnderDevelopment() {
    return (
        <div className="flex min-h-full items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 px-6">
            <div className="text-center">
                <div className="mb-8 animate-bounce text-7xl">🚧</div>

                <h1 className="text-5xl font-bold text-white">
                    Under Development
                </h1>

                <p className="mt-4 text-lg text-slate-300">
                    This feature is currently being built.
                </p>

                <div className="mt-8 flex justify-center">
                    <div className="h-2 w-56 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500"></div>
                    </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                    Please check back later.
                </p>
            </div>
        </div>
    );
}