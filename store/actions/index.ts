import { Display } from '../../interfaces/index';
import { ActionTypes } from './types';

export interface SetMediaAction {
  type: ActionTypes.setMedia;
  payload: Display[];
}

export const setMedia = (payload: Display[]): SetMediaAction => {
  return {
    type: ActionTypes.setMedia,
    payload,
  };
};

export interface AddMediaAction {
  type: ActionTypes.addMedia;
  payload: Display[];
}

export const addMedia = (payload: Display[]): AddMediaAction => {
  return {
    type: ActionTypes.addMedia,
    payload,
  };
};
