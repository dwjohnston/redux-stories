import { DEFAULT_POLL_BACKOFF_TIME } from "./main";
import { put, call,  take, delay, race,  } from "redux-saga/effects";
import { ActionBundle, ReduxSaga, SagaWatcher, ReduxAction, DataFetchFunction } from "./baseTypes";

/**
 * This a Saga Watcher
 * It is basically just a cancellable action. 
 * @param actions 
 * @param saga 
 */
export function createDefaultSagaWatcher<P, Q>(actions: ActionBundle, saga: ReduxSaga<P, Q>): SagaWatcher {

    return function* () {
        while (true) {
            const action = yield take(actions.REQUEST)
            const result = yield race({
                task: call(saga, action),
                cancel: take(actions.CANCEL)
            });
        }
    }
}

/**
 * Generic API saga. 
 * 
 * Call the async function, and dispatch it as an UPDATE and SUCCESS.
 * @param {*} actions 
 * @param {*} apiCall 
 */
export function createGenericApiSaga<P, Q>(
    actions: ActionBundle,
    apiCall: DataFetchFunction<P, Q>,
) {
    return function* (action: ReduxAction<P>) {
        try {            
            console.log("aciton", action);

            const result: Q = yield call(apiCall, action.payload);
            yield put({
                type: actions.UPDATE,
                payload: result
            })
            yield put({
                type: actions.SUCCESS,
                payload: result
            })
        }
        catch (err) {
            console.error(err);
            
            yield put({
                type: actions.FAILURE,
                payload: {
                    message: err.message, 
                    rest: err
                }
            });
        }
    }
}



/**
 * Generic API saga, for passing into the createGenericReduxThings function
 * @param {*} apiCall 
 */
export function genericApiSagaCreatorFn<P, Q>(apiCall: DataFetchFunction<P, Q>) {
    return function (actions: ActionBundle) {
        return createGenericApiSaga(actions, apiCall);
    }
}


/**
 * Pollling API saga
 * 
 * This will poll until success condition, or until cancelled. 
 * And each time it will update as well. 
 * @param apiCall 
 * @param successCondition 
 * @param backoffTime 
 */
export function pollApiSagaCreationWithUpdatesFn<P, Q>(
    apiCall: DataFetchFunction<P, Q>,
    successCondition: (result: Q) => boolean,
    backoffTime = DEFAULT_POLL_BACKOFF_TIME
) {
    return function (actions: ActionBundle) {
        return function* (action: ReduxAction<P>) {
            try {

                let result :Q = yield call(apiCall, action.payload);
                while (!successCondition(result)) {
                    yield put({
                        type: actions.UPDATE,
                        payload: result,
                    });

                    yield delay(backoffTime);
                    result = yield call(apiCall, action.payload);
                }

                console.log("poll", result);

                yield put({
                    type: actions.SUCCESS,
                    payload: result,
                });

            } catch (err) {
                console.error(err);
                yield put({
                    type: actions.FAILURE,
                    payload: err,
                });
            }

        }
    }
}

/**
 * Polling saga. 
 * 
 * This will poll until cancelled, or success condition
 * Will only update on success condition. 
 * @param apiCall 
 * @param successCondition 
 * @param backoffTime 
 */
export function pollApiSagaCreatorFn <P, Q>(
    apiCall : DataFetchFunction<P, Q>,
    successCondition : (result: Q) => boolean,
    backoffTime = DEFAULT_POLL_BACKOFF_TIME
) {


    return function (actions : ActionBundle) {
        return function* (action : ReduxAction<P>) {
            try {

                let result :Q = yield call(apiCall, action.payload);
                while (!successCondition(result)) {
                    yield delay(backoffTime);
                    result = yield call(apiCall, action.payload);
                }

                console.log("poll", result);

                yield put({
                    type: actions.UPDATE,
                    payload: result
                })
                yield put({
                    type: actions.SUCCESS,
                    payload: result,
                });

            } catch (err) {
                console.error(err);
                yield put({
                    type: actions.FAILURE,
                    payload: err,
                });
            }

        }
    }

}