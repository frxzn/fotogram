import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { bakeImageList, bakeVideoList, baseUrl, mediaUrl } from '../utils';
import {
  UserResponse,
  Users,
  User,
  MediaResponse,
  PageInfo,
  Multimedia,
} from '../interfaces';

export const search = createAsyncThunk(
  'api/search',
  async (input: string, { signal, rejectWithValue }) => {
    const source = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      source.cancel();
    });

    try {
      if (input.length) {
        const res = await axios.get<UserResponse>(
          `${baseUrl}/web/search/topsearch/?query=${input}`,
          {
            cancelToken: source.token,
          }
        );
        if (res.request.responseURL.includes('accounts/login')) {
          throw 'redirect';
        }
        return res.data.users;
      } else {
        return [];
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (err === 'redirect') {
        return rejectWithValue('Algo salió mal. Intente nuevamente más tarde');
      }
    }
  }
);

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
      let images: Multimedia[] = [];
      let videos: Multimedia[] = [];

      const userRes = await axios.get<UserResponse>(
        `${baseUrl}/web/search/topsearch/?query=${username}`,
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
      if (axios.isCancel(err)) return;
      if (err === '404') {
        return rejectWithValue('Usuario no encontrado');
      } else {
        return rejectWithValue('Algo salió mal, intenta nuevamente más tarde');
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
  images: Multimedia[];
  videos: Multimedia[];
  fresh: boolean;
  loadingMore: boolean;
  searchList: Users[];
  searchLoading: boolean;
  searchError: string;
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
  searchList: [],
  searchLoading: false,
  searchError: '',
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    reset: () => initialState,
    selectAll: (state, action: PayloadAction<'images' | 'videos'>) => {
      const selectedCount = state[action.payload].filter(
        (item) => item.selected
      ).length;
      const selected = selectedCount < state[action.payload].length;
      state[action.payload].map((item) => (item.selected = selected));
    },
    selectOne: (
      state,
      action: PayloadAction<{
        selectedTab: 'images' | 'videos';
        item: Multimedia;
      }>
    ) => {
      const itemIndex = state[action.payload.selectedTab].findIndex(
        (currItem: Multimedia) => currItem.id === action.payload.item.id
      );
      state[action.payload.selectedTab][itemIndex].selected = !state[
        action.payload.selectedTab
      ][itemIndex].selected;
    },
    closeDownload: (state, action: PayloadAction<'images' | 'videos'>) => {
      state[action.payload].map((item) => (item.selected = false));
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
      state.error = '';
      state.fresh = false;
    });
    builder.addCase(initialize.rejected, (state, action) => {
      state.error = action.payload as string;
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
    builder.addCase(search.fulfilled, (state, action) => {
      if (action.payload) {
        state.searchList = action.payload;
      }
      state.searchLoading = false;
    });
    builder.addCase(search.pending, (state) => {
      state.searchLoading = true;
    });
    builder.addCase(search.rejected, (state, action) => {
      state.searchLoading = false;
      if (action.payload) {
        state.searchError = action.payload as string;
      }
    });
  },
});

const { actions, reducer } = apiSlice;

export const { reset, selectAll, selectOne, closeDownload } = actions;

export default reducer;
