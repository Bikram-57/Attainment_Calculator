import axios from 'axios';

axios.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/refresh/' &&
            !originalRequest.url.includes('/login/')
        ) {
            originalRequest._retry = true;

            try {
                const res = await axios.get('/refresh/', {
                    withCredentials: true
                });

                const newToken = res.data.accessToken;

                // Update default header for future requests
                axios.defaults.headers.common.Authorization =
                    `Bearer ${newToken}`;

                // Update the failed request before retrying it
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newToken}`,
                };
                // originalRequest.headers.Authorization =
                //     `Bearer ${newToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                console.log('Refresh token failed:', refreshError);

                // Optional: redirect to login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);