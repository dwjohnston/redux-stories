import { ActionBundle, DataFetchFunction, PayloadType, ReduxAction, SagaYields, ReduxSaga, ReduxSagaWatcher } from "./baseTypes";
import { put, call,  take, delay, race,  } from "redux-saga/effects";


//TOdo - fix signature
export function createDefaultSagaWatcher(actions: ActionBundle, saga: ReduxSaga<any, any>): ReduxSagaWatcher {

    return function* () {

        console.log("watcher"); 

        while (true) {
            const action = yield take(actions.REQUEST)
            const result = yield race({
                task: call(saga, action),
                cancel: take(actions.CANCEL)
            });
        }
    }
}

export function createGenericApiSaga<P extends PayloadType, Q extends PayloadType>(
    actions: ActionBundle,
    apiCall: DataFetchFunction<P, Q>,
) : ReduxSaga<P, Q> {

    const saga = function* (action: ReduxAction<P>) {
        console.log(action); 

        try {            
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
            yield put({
                type: actions.FAILURE,
                payload: {
                    message: err.message, 
                    rest: err
                }
            });
        }
    }  as unknown as ReduxSaga<P,Q> //todo


    return saga; 
}
