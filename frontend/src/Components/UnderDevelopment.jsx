import React from 'react'

function UnderDevelopment() {
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

export default UnderDevelopment