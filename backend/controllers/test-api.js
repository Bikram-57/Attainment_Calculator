async function runTest() {
    console.log("🚀 Starting API Test...\n");

    try {
        // ==========================================
        // 1. TEST THE LOGIN API
        // ==========================================
        console.log("👉 1. Attempting to Login...");
        
        // const loginResponse = await fetch('http://localhost:8000/login', {
        const loginResponse = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: "krishna.si@smit.smu.edu.id", // 👈 Inserted Dr. Krishna's email!
                password: "Krishna@2026"         // 👈 See my note below!
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.log("❌ Login Failed! Check your email/password.");
            return console.log(loginData);
        }

        console.log("✅ Login Successful! We got BOTH tokens:");
        console.log("Access Token:", loginData.accessToken.substring(0, 20) + "...");
        console.log("Refresh Token:", loginData.refreshToken.substring(0, 20) + "...\n");


        // ==========================================
        // 2. TEST THE REFRESH API
        // ==========================================
        console.log("👉 2. Simulating an expired Access Token. Asking for a new one...");
        
        // const refreshResponse = await fetch('http://localhost:8000/login/refresh', {
        const refreshResponse = await fetch('http://127.0.0.1:8000/login/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                refreshToken: loginData.refreshToken 
            })
        });

        const refreshData = await refreshResponse.json();

        if (refreshData.success) {
            console.log("✅ Refresh Successful! The server gave us a brand new Access Token:");
            console.log("NEW Access Token:", refreshData.accessToken);
            console.log("\n🎉 YOUR AUTHENTICATION SYSTEM IS 100% WORKING!");
        } else {
            console.log("❌ Refresh Failed!");
            console.log(refreshData);
        }

    } catch (error) {
        console.error("❌ Test crashed:", error.message);
    }
}

runTest();