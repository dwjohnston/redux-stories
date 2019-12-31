import {  all} from "redux-saga/effects";
import { combineReducers } from "redux";
import {   ReduxReducer, SagaWatcher, Story } from "./baseTypes";
export const DEFAULT_LOADING_REDUCER_NAME = "loading";
export const DEFAULT_ERROR_REDUCER_NAME = "error";

export const DEFAULT_POLL_BACKOFF_TIME = 2000;



export function createRootReducer<S,P> (stories : Story<S, object>[], existingReducers : ReduxReducer<S, P> ){
    return combineReducers(
        stories.reduce(
            (acc, cur) => (
                {
                    ...acc,
                    [cur.reducerName]: cur.reducer
                }
            ), { ...existingReducers }
        )
    );
}

export function createRootSaga<S> (stories : Story<S, object>[], existingSagas  : SagaWatcher[]  = []){
    return function* () {
        yield all(stories.reduce((acc, cur) => [...acc, ...cur.sagas], [...existingSagas]));
    }
}




