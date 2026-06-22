import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss()
	],
	server: {
		proxy: {
			'/login/': 'http://localhost:8000',
			'/logout/': 'http://localhost:8000',
			'/refresh/': 'http://localhost:8000',
			'/forgot-password/': 'http://localhost:8000',
			'/user/': 'http://localhost:8000',
			'/sub/': 'http://localhost:8000',
			'/uploadAll/': 'http://localhost:8000',
			'/mark/upload-raw': 'http://localhost:8000',
			'/mark/get-calculations': 'http://localhost:8000',
			'/mark/get-final-attainment': 'http://localhost:8000',
			'/co-po/relation': 'http://localhost:8000',
			'/calpo/': 'http://localhost:8000',
			'/co-po/save-relation': 'http://localhost:8000',
			'/assignSub/': 'http://localhost:8000',
			'/file/': 'http://localhost:8000',
			'/rubrics/': 'http://localhost:8000',
			'/dir/': 'http://localhost:8000',
		},
	},
})
