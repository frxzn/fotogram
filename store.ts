import { configureStore } from '@reduxjs/toolkit';
import userInterfaceReducer from './slices/UserInterfaceSlice';
import apiReducer from './slices/apiSlice';
import { useDispatch } from 'react-redux';

const store = configureStore({
  reducer: {
    userInterface: userInterfaceReducer,
    api: apiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
