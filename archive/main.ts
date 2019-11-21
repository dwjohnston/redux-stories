import {  all} from "redux-saga/effects";
import { combineReducers } from "redux";
import {  ReduxStory, ReduxReducer, SagaWatcher } from "./baseTypes";
export const DEFAULT_LOADING_REDUCER_NAME = "loading";
export const DEFAULT_ERROR_REDUCER_NAME = "error";

export const DEFAULT_POLL_BACKOFF_TIME = 2000;




export * from "./baseTypes"; 
export * from "./selectors"; 
export * from "./stories"; 
export * from "./errorAndLoading"; 
export * from "./reducers"; 
export * from "./sagas"; 
export * from "./util"; 


export function createRootReducer<S,P> (reduxes : ReduxStory<S, object>[], existingReducers : ReduxReducer<S, P> ){
    return combineReducers(
        reduxes.reduce(
            (acc, cur) => (
                {
                    ...acc,
                    [cur.reducerName]: cur.reducer
                }
            ), { ...existingReducers }
        )
    );
}

export function createRootSaga<S> (reduxes : ReduxStory<S, object>[], existingSagas  : SagaWatcher[]  = []){
    return function* () {
        yield all(reduxes.reduce((acc, cur) => [...acc, ...cur.sagas], [...existingSagas]));
    }
}




