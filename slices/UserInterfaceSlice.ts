import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IState {
  selectedTab: 'images' | 'videos';
  showMedia: boolean;
  selectedMediaIndex: number;
  downloadMode: boolean;
  username?: string;
}

const initialState: IState = {
  selectedTab: 'images',
  showMedia: false,
  selectedMediaIndex: 0,
  downloadMode: false,
  username: undefined,
};

const userInterfaceSlice = createSlice({
  name: 'userInterface',
  initialState,
  reducers: {
    reset: (state) => ({ ...initialState, username: state.username }),
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
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
  setUsername,
  setSelectedTab,
  setShowMedia,
  setSelectedMediaIndex,
  setDownloadMode,
} = actions;

export default reducer;
