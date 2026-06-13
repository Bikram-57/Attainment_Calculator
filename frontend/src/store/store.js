import { configureStore } from '@reduxjs/toolkit';
import sideBarSlice from './sideBarSlice';
import authSlice from './authSlice';

const store = configureStore({
    reducer: {
        sideBar: sideBarSlice,
        auth: authSlice
    }
});

export default store;
