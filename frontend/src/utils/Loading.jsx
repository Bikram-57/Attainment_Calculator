import React from 'react'

function Loading({ type, className, h = 8, w = 8 }) {
    return !type ? (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
                <span className="text-sm font-medium text-slate-600">
                    Loading data...
                </span>
            </div>
        </div>
    ) : (
        <div className={`mx-2 ${className}`}>
            <div className={`h-${h} w-${w} animate-spin rounded-full border-4 border-slate-200 border-t-slate-700`} />
        </div>
    )
}

export default Loading