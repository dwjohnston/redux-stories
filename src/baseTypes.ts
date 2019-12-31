import { Reducer, AnyAction } from "redux";
import { PutEffect, CallEffect } from "redux-saga/effects";



export interface BaseActorInterface<P, Q> {

}

/**
 * S = State
 * K = Keys
 */
export interface Story<S extends StateType, K extends ActorMap> {

    reducerName: string;
    reducer: ReduxReducer<S, any>;
    sagas: ReduxSaga<any, any>[];
    actors: Record<keyof K, Actor<S, PayloadType, PayloadType>>;
}

export type PayloadType = any | undefined; 
export type StateType = PayloadType; 

export type ActorMap = object extends Record<string, BaseActorInterface<PayloadType, PayloadType>>>; 


/**
 * S = State
 * P = RequestPayload
 * Q = SuccessPayload
 */
export interface Actor<S extends StateType, P extends PayloadType, Q> {
    actions: ActionBundle;
    createAction: ActionCreator<P>;
    cancelAction: ActionCreator<undefined>;
    resetAction: ActionCreator<undefined>;
    clearErrorsAction: ActionCreator<undefined>;
    saga: ReduxSaga<P, Q>;
    reducerCreator: ReducerCreator<S, Q>; 
}


export type ActionCreator<P> = (payload: P) => ReduxAction<P>;

export interface ReduxAction<P> {
    type: string;
    payload: P;
}


export interface ActionBundle {
    BASE_NAME: string;
    REQUEST: string;
    SUCCESS: string;
    FAILURE: string;
    RESET: string;
    CANCEL: string;
    CANCELLED: string;
    UPDATE: string;
    CLEAR_ERRORS: string; 
}

export type DataFetchFunction<P extends PayloadType, Q extends PayloadType> = (payload: P) => Promise<Q>;  

//Todo extend this as needed
export type SagaYields = PutEffect<any> | CallEffect<any>; 

export interface ReduxSaga<P, Q> {
    (action: ReduxAction<P>): Generator<SagaYields, ReduxAction<PayloadType>, SagaYields>;
}


export interface SagaWatcher {
    (): Iterable<any>
}



export interface ReducerCreatorCreator<S extends StateType, Q extends PayloadType> {
    (actionBundle: ActionBundle) : ReducerCreator<S, Q>
}
export interface ReducerCreator<S extends StateType, Q extends PayloadType> {
    (initialState: S): ReduxReducer<S, Q>;
}

export interface ReduxReducer<S extends StateType, Q extends PayloadType> {
    (state: S, action: ReduxAction<Q>): S;
}