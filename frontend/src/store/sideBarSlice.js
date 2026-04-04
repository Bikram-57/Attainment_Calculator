import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isSideBarOpen : true,
};

const sideBarSlice = createSlice({
    name: 'sideBar',
    initialState,
    reducers: {
        open: (state) => {
            state.isSideBarOpen = true;
        },
        close: (state) => {
            state.isSideBarOpen = false;
        },
    }
});

export const {open, close} = sideBarSlice.actions;

export default sideBarSlice.reducer;
