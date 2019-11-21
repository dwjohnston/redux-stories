import { put,  } from "redux-saga/effects";
import reduceReducers from "reduce-reducers";
import {
    StoryLineOptions,
    ReduxStoryLine,
    ActionBundle,
    ActionCreator,
    ReduxSaga,
    SagaWatcher,
    ReduxReducer,
    DataSelector,
    StoryOptions,
    ReduxStory,
    ReduxAction,
    ErrorPackage,
    LoadingState,
    ErrorState,
    StoryConfigs,
    StoryLines,
} from "./baseTypes";
import { DEFAULT_ERROR_REDUCER_NAME, DEFAULT_LOADING_REDUCER_NAME } from "./main";
import { createDefaultDataSelector, createStatusSelector } from "./selectors";
import { shallowMergeReducer } from "./reducers";
import { createDefaultSagaWatcher } from "./sagas";
import { Saga } from "@redux-saga/core";
import { createClearSpecificError } from "./errorAndLoading";



export function createGenericCombinedReduxOnSingleReducer<S, K extends StoryConfigs<S>> (
    reducerName: string,
    actionConfigsObj:  K,
    _options?: StoryOptions<S>
) : ReduxStory<S, K> {

    const options :StoryOptions<S> = _options || {};   
    const reduxes = Object.entries(actionConfigsObj).reduce((acc, cur) => {
        return {
            ...acc,
            [cur[0]]: createGenericRedux({ ...cur[1], reducerName })
        }
    }, {} as StoryLines<S, K>); //What's going on with the typings here is confusing, 
    //see: https://stackoverflow.com/questions/56454795/define-an-interface-as-having-all-the-keys-of-a-given-object/56454883#56454883
    //This is basically a way of enforcing that the story.reduxes keys match the config you passed in. 

    const combineReducersFn = options.combineReducersFn || reduceReducers;
    const initialState = options.initialState || {}; 
    return {
        reducerName: reducerName,
        reducer: combineReducersFn(initialState, ...Object.values(reduxes).map(v => v.reducer)),
        sagas: Object.values(reduxes).map(v => v.sagaWatcher),
        reduxes: reduxes,
        dataSelector: (state : S) => state[reducerName]
    }
};

/**
 * This is the main thing. 
 * 
 * This will create: 
 * 
 * - actions: An object containing the REQUEST / SUCCESS / FAILURE / RESET actions
 * - actionFn: A function to create the action with a payload. 
 * - saga: The saga the runs on the REQUESTs
 * - sagaWatcher: The saga to intercept the REQUESTs and tell the saga to run
 * - reducer: The reducer that runs on SUCCESS and RESET
 * - reducerName: the top level name that this redux will be referred to in the store. 
 * - dataSelector A function to select all the data in this particular redux
 * @param {*} baseName 
 * @param {*} options 
 */
export function createGenericRedux<S,P,Q, T>(
    options: StoryLineOptions<S, P, Q, T>
): ReduxStoryLine<S,P, Q, T> {

    const { baseName } = options;
    if (!baseName) {
        throw new Error("No baseName provided");
    }
    /**
     * Actions bundle
     */
    const actions: ActionBundle = {
        BASE_NAME: baseName,
        REQUEST: `${baseName}_REQUEST`,
        SUCCESS: `${baseName}_SUCCESS`,
        FAILURE: `${baseName}_FAILURE`,
        RESET: `${baseName}_RESET`,
        CANCEL: `${baseName}_CANCEL`,
        CANCELLED: `${baseName}_CANCELLED`,
        UPDATE: `${baseName}_UPDATE`,
    }

    /**
     * Action creator
     * default: first argument is payload
     */
    const actionFn: ActionCreator<P> = options.actionFnCreator && options.actionFnCreator(actions) || function (payload: P) {
        const action = {
            type: actions.REQUEST,
            payload, 
        }
        return action; 
    };

    const cancelFn: ActionCreator<void> = options.cancelFnCreator && options.cancelFnCreator(actions) || function () {
        return {
            type: actions.CANCEL,
            payload: null
        }
    }

    const resetFn: ActionCreator<void>  = function () {
        return {
            type: actions.RESET, 
            payload: null, 
        }
    }; 

    const  clearErrorsFn = function() {
        return createClearSpecificError(actions.BASE_NAME); 
    }


    /**
     * Saga - Runs when the sagaWatcher tells it to. 
     * choose sagaFn first, then saga, then default saga (dispatch success immediately). 
     */
    const saga: ReduxSaga<P, Q> = (options.sagaFn && options.sagaFn(actions)) || function* (action: ReduxAction<P>) {

        yield put({
            type: actions.UPDATE,
            payload: <Q><unknown> (action.payload)
        })
        yield put({
            type: actions.SUCCESS,
            payload: <Q><unknown> (action.payload)
        });
    };

    /**
     * Saga Watcher- 
     * default: takeEvery(actions.REQUEST)
     */
    const sagaWatcher: SagaWatcher = options.sagaWatcherFn && options.sagaWatcherFn(actions, saga)
        || createDefaultSagaWatcher(actions, saga);

    /**
     * Inital State - 
     * default: {}
     */

     if (!options.initialState) {
         console.warn("No initial state was given, defaulting to {}"); 
     }
    const initialState: S = options.initialState ||  null as S;

    /**
     * reducer -
     * default: payload is assigned to state (clobbers)
     */
    const reducer: ReduxReducer<S,Q> = (options.reducerFn && options.reducerFn(actions, initialState))
        || shallowMergeReducer<S, Q>()(actions, initialState);

    const reducerName: string = options.reducerName || baseName;

    /**
     * Data selector -
     * default: select entire state
     */


    const dataSelector: DataSelector<S, T> = options.dataSelectorFn && options.dataSelectorFn(reducerName)
        || createDefaultDataSelector<S, T>(reducerName);

    const loadingReducerName: string = options.loadingReducerName || DEFAULT_LOADING_REDUCER_NAME;
    const loadingSelector: DataSelector<LoadingState, boolean>  = (options.loadingSelectorFn && options.loadingSelectorFn(loadingReducerName)) || function (state) {
        return state[loadingReducerName][actions.BASE_NAME];
    }

    const errorReducerName: string = options.errorReducerName || DEFAULT_ERROR_REDUCER_NAME;
    const errorSelector: DataSelector<ErrorState, ErrorPackage>  = (options.errorSelectorFn && options.errorSelectorFn(errorReducerName)) || function (state) {
        return state[errorReducerName][actions.BASE_NAME]
    }

    const getStatus = createStatusSelector<S, T>(dataSelector, loadingSelector, errorSelector); 


    const showLoadingCursor = options.showLoadingCursor !== undefined ? options.showLoadingCursor : true; 
    const showError = options.showError !== undefined ? options.showError : true; 
    return {
        actions,
        actionFn,
        cancelFn,
        saga,
        sagaWatcher,
        reducer,
        reducerName,
        dataSelector,
        loadingSelector,
        errorSelector,
        showLoadingCursor, 
        getStatus, 
        resetFn, 
        clearErrorsFn,
        showError, 
    }
}