import {  ReduxReducer, ActionBundle, ReduxAction, ReducerCreator, ReduxStoryLine } from "./baseTypes";

/**
 * These all make sense, I promise. 
 */

/**
 * Replace the state with whatever the payload was. 
 */
export function clobberReducer<S, P extends S>(): ReducerCreator<S, P> {
    return (
        actions: ActionBundle,
        initialState: any,
    ) => (state = initialState, action: ReduxAction<P>) => {

        if (action.type === actions.UPDATE) {
            return action.payload;
        }

        if (action.type === actions.RESET) {
            return initialState;
        }
        return state;
    }
}

/**
 * Given a array of values, create an object key:values, where the key is fieldName of the value.
 * @param fieldName 
 */
export function indexByIdReducer<S extends object,P extends any[] > (fieldName = "id"): ReducerCreator<S, P> {
    return (actions: ActionBundle, initialState: S) =>
        (state = initialState, action: ReduxAction<P>) => {
            const { type, payload } = action;
            switch (type) {

                case actions.UPDATE: {
                    console.log(action);
                    return payload.reduce((acc, cur) => {
                        return { ...acc, [cur[fieldName]]: cur };
                    }, {});
                }
                case actions.RESET: return initialState;
                default: return state;
            }
        }
}

/**
 * Merge the payload in with the existing state. 
 */
export function shallowMergeReducer<S, P>(): ReducerCreator<S, P> {
    return (actions, initialState) => (state = initialState, action) => {
        const { type, payload } = action;
        switch (type) {
            case actions.UPDATE: {
                return { ...state, ...payload };
            }
            case actions.RESET: return initialState;
            default: return state;
        }
    }
}

/**
 * Merge the payload into the the object that is at key fieldname. 
 * @param fieldName 
 */
export function shallowMergeOnFieldNameReducer<S, P>(fieldName = "id"): ReducerCreator<S, P> {
    return (actions, initialState) => (state = initialState, action) => {
        const { type, payload } = action;
        switch (type) {

            case actions.UPDATE: {
                return { ...state, ...{ [payload[fieldName]]: payload } };
            }
            case actions.RESET: return initialState;
            default: return state;
        }
    }
}

/**
 * Delete the key of the state that is payloads fieldName
 * @param fieldName 
 */
export function deleteByFieldNameReducer<S extends object, P>(fieldName = "id"): ReducerCreator<S, P> {
    return (actions: ActionBundle, initialState: S) =>
        (state = initialState, action: ReduxAction<P>) => {
            const { type, payload } = action;
            switch (type) {

                case actions.UPDATE: {
                    const newState = { ...state };
                    delete newState[payload[fieldName]]
                    return newState;
                }
                case actions.RESET: return initialState;
                default: return state;
            }
        }
}

/**
 * Reset the state to a static value. 
 * @param resetTo 
 */
export function resetReducer<S, P> (resetTo?: S) :  ReducerCreator<S, P>  {
    return (actions: ActionBundle, initialState: S) =>
        (state = initialState, action: ReduxAction<P>) => {
            const { type, payload } = action;
            switch (type) {

                case actions.UPDATE: {
                    return resetTo || initialState;
                }
                case actions.RESET: return initialState;
                default: return state;
            }

        }
}

/**
 * For the given list of reduxes, create return the reducerName: reducer object
 * @param {*} reduxes 
 */
export function createReducers(reduxes : ReduxStoryLine<any, any, any, any>[]) : {[key:string] : ReduxReducer<any, any>}  {
    return reduxes.reduce((acc, cur) => {
        return { ...acc, [cur.reducerName]: cur.reducer }
    }, {});
}

