import { Actor, ActionBundle, ReduxAction, PayloadType, ActionCreator, DataFetchFunction } from "./baseTypes";
import { createGenericApiSaga, createDefaultSagaWatcher } from "./sagas";
import { createCreateClobberReducer } from "./reducers";


export function createActionBundle(baseName: string): ActionBundle {
    return {
        BASE_NAME: baseName,
        REQUEST: baseName + "_REQUEST",
        SUCCESS: baseName + "_SUCCESS",
        FAILURE: baseName + "_FAILURE",
        RESET: baseName + +"_RESET",
        CANCEL: baseName + "_CANCEL",
        CANCELLED: baseName + "_CANCELLED",
        UPDATE: baseName + "_UPDATE",
        CLEAR_ERRORS: baseName + "_CLEARERRORS", 
    }
}


export function defaultCreateActionCreator<P extends PayloadType>(actionBundles: ActionBundle): ActionCreator<P> {
    return (payload: P) => {
        return {
            type: actionBundles.REQUEST,
            payload: payload,
        } as ReduxAction<P>;
    }
}

//Todo - change this to allow a 'cancel reason' string. 
export function defaultCreateCancelCreator(actionBundles: ActionBundle): ActionCreator<undefined> {
    return () => {
        return {
            type: actionBundles.CANCEL,
            payload: undefined, 
        };
    }
}
export function defaultCreateResetCreator(actionBundles: ActionBundle): ActionCreator<undefined> {
    return () => {
        return {
            type: actionBundles.RESET,
            payload: undefined, 
        };
    }
}


export function defaultCreateClearErrorsAction(actionBundles: ActionBundle): ActionCreator<undefined> {
    return () => {
        return {
            type: actionBundles.CLEAR_ERRORS,
            payload: undefined, 
        };
    }
}

export function createActor<S, P extends PayloadType, Q extends PayloadType>(baseName: string, apiCall: DataFetchFunction<P, Q>): Actor<S, P, Q> {


    const actionBundles = createActionBundle(baseName);
    const saga = createGenericApiSaga(actionBundles, apiCall); 
    return {
        actions: actionBundles,
        createAction: defaultCreateActionCreator<P>(actionBundles),
        cancelAction: defaultCreateCancelCreator(actionBundles), 
        resetAction: defaultCreateResetCreator(actionBundles), 
        clearErrorsAction: defaultCreateClearErrorsAction(actionBundles), 
        saga: saga, 
        sagaWatcher: createDefaultSagaWatcher(actionBundles, saga), 
        reducerCreator: createCreateClobberReducer(actionBundles), 
    }
}