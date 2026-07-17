// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
// 	plugins: [
// 		react(),
// 		tailwindcss()
// 	],
// 	server: {
// 		proxy: {
// 			'/login/': 'http://localhost:8000',
// 			'/logout/': 'http://localhost:8000',
// 			'/refresh/': 'http://localhost:8000',
// 			'/forgot-password/': 'http://localhost:8000',
// 			'/user/': 'http://localhost:8000',
// 			'/sub/': 'http://localhost:8000',
// 			'/uploadAll/': 'http://localhost:8000',
// 			'/mark/': 'http://localhost:8000',
// 			// '/mark/get-calculations': 'http://localhost:8000',
// 			// '/mark/get-final-attainment': 'http://localhost:8000',
// 			'/co-po/': 'http://localhost:8000',
// 			'/calpo/': 'http://localhost:8000',
// 			// '/co-po/save-relation': 'http://localhost:8000',
// 			'/assignSub/': 'http://localhost:8000',
// 			'/file/': 'http://localhost:8000',
// 			'/rubrics/': 'http://localhost:8000',
// 			'/dir/': 'http://localhost:8000',
// 			'/report/': 'http://localhost:8000',
// 			'/download-format/': 'http://localhost:8000',
// 			'/home/': 'http://localhost:8000',
// 			'/activity/': 'http://localhost:8000',
// 			'/subject-analysis/': 'http://localhost:8000',
// 			'/sub-upload/': 'http://localhost:8000',
// 		},
// 	},
// })





import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs' // <-- ADD THIS to read your certificates

// Define your backend URL (Make sure it is https!)
const backendTarget = 'https://localhost:8000';

// Helper function to handle self-signed certificates in the proxy
const secureProxy = {
    target: backendTarget,
    secure: false, // <-- CRITICAL: Allows Vite proxy to talk to your local HTTPS backend
    changeOrigin: true
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    server: {
        host: '0.0.0.0', // <-- ADD THIS: Exposes your app to the local network (192.168.x.x)
        https: {         // <-- ADD THIS: Secures the frontend
            key: fs.readFileSync('./local-key.pem'),
            cert: fs.readFileSync('./local-cert.pem'),
        },
        proxy: {
            '/login/': secureProxy,
            '/logout/': secureProxy,
            '/refresh/': secureProxy,
            '/forgot-password/': secureProxy,
            '/user/': secureProxy,
            '/sub/': secureProxy,
            '/uploadAll/': secureProxy,
            '/mark/': secureProxy,
            '/co-po/': secureProxy,
            '/calpo/': secureProxy,
            '/assignSub/': secureProxy,
            '/file/': secureProxy,
            '/rubrics/': secureProxy,
            '/dir/': secureProxy,
            '/report/': secureProxy,
            '/download-format/': secureProxy,
            '/home/': secureProxy,
            '/activity/': secureProxy,
            '/subject-analysis/': secureProxy,
            '/sub-upload/': secureProxy,
            '/user-dashboard': secureProxy,
        },
    },
})