import { configureStore } from '@reduxjs/toolkit';
import userInterfaceReducer from './slices/UserInterfaceSlice';
import apiReducer from './slices/apiSlice';

const store = configureStore({
  reducer: {
    userInterface: userInterfaceReducer,
    api: apiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
