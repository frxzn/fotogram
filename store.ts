import { configureStore } from '@reduxjs/toolkit';
import userInterfaceReducer from './slices/UserInterfaceSlice';

const store = configureStore({
  reducer: {
    userInterface: userInterfaceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
