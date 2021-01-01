import { Display } from '../../interfaces';
import { SetMediaAction, AddMediaAction } from '../actions';
import { ActionTypes } from '../actions/types';

interface State {
  mediaList: Display[];
}

const initialState: State = {
  mediaList: [],
};

type Actions = SetMediaAction | AddMediaAction;

export const mediaReducer = (state = initialState, action: Actions) => {
  switch (action.type) {
    case ActionTypes.setMedia:
      return { ...state, mediaList: action.payload };
    case ActionTypes.addMedia:
      return { ...state, mediaList: [...state.mediaList, ...action.payload] };
    default:
      return state;
  }
};
