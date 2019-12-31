import { ActionBundle, DataFetchFunction, PayloadType, ReduxAction } from "./baseTypes";
import { put, call,  take, delay, race,  } from "redux-saga/effects";

export function createGenericApiSaga<P extends PayloadType, Q extends PayloadType>(
    actions: ActionBundle,
    apiCall: DataFetchFunction<P, Q>,
) {
    return function* (action: ReduxAction<P>) {
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
    }
}
