function ProfileInfoCard({ icon, title, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
                {icon}
                <span className="text-sm">{title}</span>
            </div>

            <p className="font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

export default ProfileInfoCard;