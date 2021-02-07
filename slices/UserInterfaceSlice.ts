import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IState {
  selectedTab: 'images' | 'videos';
  showMedia: boolean;
  selectedMediaIndex: number;
  downloadMode: boolean;
}

const initialState: IState = {
  selectedTab: 'images',
  showMedia: false,
  selectedMediaIndex: 0,
  downloadMode: false,
};

const userInterfaceSlice = createSlice({
  name: 'userInterface',
  initialState,
  reducers: {
    reset: () => initialState,
    setSelectedTab: (state, action: PayloadAction<'images' | 'videos'>) => {
      state.selectedTab = action.payload;
    },
    setShowMedia: (state, action: PayloadAction<boolean>) => {
      state.showMedia = action.payload;
    },
    setSelectedMediaIndex: (state, action: PayloadAction<number>) => {
      state.selectedMediaIndex = action.payload;
    },
    setDownloadMode: (state, action: PayloadAction<boolean>) => {
      state.downloadMode = action.payload;
    },
  },
});

const { actions, reducer } = userInterfaceSlice;

export const {
  reset,
  setSelectedTab,
  setShowMedia,
  setSelectedMediaIndex,
  setDownloadMode,
} = actions;

export default reducer;
