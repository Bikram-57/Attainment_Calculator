import React from "react";
import Overview from "./Overview";
import RecentActivity from "./RecentActivity";
import ProgressCharts from "./ProgressCharts";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useSelector } from 'react-redux'
function Dashboard() {
    console.log(useSelector(s => s.auth.accessToken))
    const [activeSubjectCount, setActiveSubjectCount] = useState([]);

    useEffect(() => {
        const getActiveSubjectsCount = async () => {
            try {
                const res = await axios.get('/home/total-subject');
                setActiveSubjectCount(res.data.data);
            } catch (error) {
                console.log('ERROR || Dashboard || useEffect || getActiveSubjectsCount || ', error);
            }
        }
        getActiveSubjectsCount();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="mx-auto max-w-7xl overflow-y-auto">
                <Overview activeSubjectCount={activeSubjectCount} />
                <RecentActivity activeSubjectCount={activeSubjectCount} />
                <ProgressCharts />
            </div>
        </div>
    );
}

export default Dashboard;
