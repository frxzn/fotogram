import { createStore, combineReducers } from 'redux';
import { mediaReducer } from './media';

const root = combineReducers({
  media: mediaReducer,
});

export type RootState = ReturnType<typeof root>;
export const store = createStore(root);
