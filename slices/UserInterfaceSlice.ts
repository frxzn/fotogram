import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  selectedTab: 'images',
  showMedia: false,
  selectedMediaIndex: 0,
  downloadMode: false,
};

const userInterfaceSlice = createSlice({
  name: 'userInterface',
  initialState,
  reducers: {
    setSelectedTab(state, action: PayloadAction<string>) {
      state.selectedTab = action.payload;
    },
    setShowMedia(state, action: PayloadAction<boolean>) {
      state.showMedia = action.payload;
    },
    setSelectedMediaIndex(state, action: PayloadAction<number>) {
      state.selectedMediaIndex = action.payload;
    },
    setDownloadMode(state, action: PayloadAction<boolean>) {
      state.downloadMode = action.payload;
    },
  },
});

const { actions, reducer } = userInterfaceSlice;

export const {
  setSelectedTab,
  setShowMedia,
  setSelectedMediaIndex,
  setDownloadMode,
} = actions;

export default reducer;
