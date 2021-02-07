import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { bakeImageList, bakeVideoList, mediaUrl } from '../utils';
import {
  UserResponse,
  Users,
  User,
  MediaResponse,
  PageInfo,
  Image,
  Video,
} from '../interfaces';

export const initialize = createAsyncThunk(
  'api/initialize',
  async (username: string, { signal, rejectWithValue }) => {
    const userSource = axios.CancelToken.source();
    const mediaSource = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      userSource.cancel();
      mediaSource.cancel();
    });

    try {
      let user;
      let pageInfo;
      let images: Image[] = [];
      let videos: Video[] = [];

      const userRes = await axios.get<UserResponse>(
        `https://www.instagram.com/web/search/topsearch/?query=${username}`,
        {
          cancelToken: userSource.token,
        }
      );

      const currentUser = userRes.data.users.find(
        (users: Users) => users.user.username === username
      );

      if (currentUser) {
        user = currentUser.user;

        if (!currentUser.user.is_private) {
          const mediaRes = await axios.get<MediaResponse>(
            mediaUrl(currentUser.user.pk),
            {
              cancelToken: mediaSource.token,
            }
          );

          pageInfo =
            mediaRes.data.data.user.edge_owner_to_timeline_media.page_info;

          images = bakeImageList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges
          );

          videos = bakeVideoList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges
          );
        }
      } else {
        throw '404';
      }
      return {
        user,
        pageInfo,
        images,
        videos,
      };
    } catch (err) {
      if (axios.isCancel(err)) return; // abort promise
      if (err === '404') {
        return rejectWithValue({ message: 'Usuario no encontrado' });
      } else {
        return rejectWithValue({
          message: 'Algo salió mal, intenta nuevamente más tarde',
        });
      }
    }
  }
);

interface LoadMorePayload {
  pk: string;
  endCursor: string;
  imagesCount: number;
  videosCount: number;
}

export const loadMore = createAsyncThunk(
  'api/loadMore',
  async (payload: LoadMorePayload) => {
    const { pk, endCursor, imagesCount, videosCount } = payload;
    try {
      const mediaRes = await axios.get<MediaResponse>(mediaUrl(pk, endCursor));

      const pageInfo =
        mediaRes.data.data.user.edge_owner_to_timeline_media.page_info;

      const images = bakeImageList(
        mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
        imagesCount
      );

      const videos = bakeVideoList(
        mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
        videosCount
      );

      return {
        pageInfo,
        images,
        videos,
      };
    } catch (err) {
      console.log(err);
    }
  }
);

interface IState {
  loading: boolean;
  error: string;
  user: User | undefined;
  pageInfo: PageInfo | undefined;
  images: Image[];
  videos: Video[];
  fresh: boolean;
  loadingMore: boolean;
}

const initialState: IState = {
  loading: true,
  error: '',
  user: {} as User,
  pageInfo: {} as PageInfo,
  images: [],
  videos: [],
  fresh: true,
  loadingMore: false,
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    reset: () => initialState,
    selectAll: (state, action: PayloadAction<'images' | 'videos'>) => {
      const selectedCount = (state[action.payload] as any[]).filter(
        (item: Image | Video) => item.selected
      ).length;
      const selected = selectedCount < state[action.payload].length;
      (state[action.payload] as any[]).map(
        (item: Image | Video) => (item.selected = selected)
      );
    },
    selectOne: (
      state,
      action: PayloadAction<{
        selectedTab: 'images' | 'videos';
        item: Image | Video;
      }>
    ) => {
      const itemIndex = state[action.payload.selectedTab].findIndex(
        (currItem: Image | Video) => currItem.id === action.payload.item.id
      );
      state[action.payload.selectedTab][itemIndex].selected = !state[
        action.payload.selectedTab
      ][itemIndex].selected;
    },
    closeDownload: (state, action: PayloadAction<'images' | 'videos'>) => {
      (state[action.payload] as any[]).map(
        (item: Image | Video) => (item.selected = false)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.pageInfo = action.payload.pageInfo;
        state.images = action.payload.images;
        state.videos = action.payload.videos;
      }
      state.loading = false;
      state.fresh = false;
    });
    builder.addCase(initialize.rejected, (state, action) => {
      if (action.error.message) {
        state.error = action.error.message;
      }
      state.loading = false;
      state.fresh = false;
    });
    builder.addCase(loadMore.pending, (state) => {
      state.loadingMore = true;
    });
    builder.addCase(loadMore.fulfilled, (state, action) => {
      if (action.payload) {
        state.pageInfo = action.payload?.pageInfo;
        state.images = state.images?.concat(action.payload.images);
        state.videos = state.videos?.concat(action.payload.videos);
      }
      state.loadingMore = false;
    });
    builder.addCase(loadMore.rejected, (state) => {
      state.loadingMore = false;
    });
  },
});

const { actions, reducer } = apiSlice;

export const { reset, selectAll, selectOne, closeDownload } = actions;

export default reducer;

// Add search thunk
