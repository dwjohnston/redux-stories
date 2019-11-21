import { ReduxStory, ReduxReducer, ReduxStoryLine, ErrorState, LoadingState } from "./baseTypes";
import { unpackStoriesIntoStoryLines } from "./util";

export function createPendingFlagReducer(reduxes) {
    const initialState = reduxes.reduce((acc, cur) => {
        return { ...acc, [cur.actions.BASE_NAME]: true }
    }, {});

    return function (state = initialState, action) {

        const { type } = action;
        const matches = /(.*)_(REQUEST|SUCCESS|FAILURE|RESET)/.exec(type);
        if (!matches) return state;

        const [, requestName, requestState] = matches;
        return {
            ...state,
            [requestName]: !(requestState === 'REQUEST'),
        }

    }
}

/**
 * This is a bit hacky for now. 
 */
const CLEAR_ALL_ERRORS_SUCCESS = "CLEAR_ALL_ERRORS_SUCCESS";
const CLEAR_SPECIFIC_ERROR = "CLEAR_SPECIFIC_ERROR"; 

export function createClearSpecificError(baseName: string) {

    return {
        type: CLEAR_SPECIFIC_ERROR, 
        payload: baseName
    }


}
export function requestClearAllErrors() {
    return {
        type: CLEAR_ALL_ERRORS_SUCCESS,
        payload: null, 
    };
}

export function selectAllErrors(state) {
    return Object.values(state.error).filter(v => !!v);
}
export const RESET_LOADING_ACTION = 'RESET_LOADING_ACTION'; 
/**
 * The error reducer
 * Only needs to be called once
 * 
 * For the given list of reduxes, it will instantiate them to null
 * @param {*} reduxes 
 */
export function createErrorReducer(reduxes : ReduxStoryLine<any, any, any, any>[])  : ReduxReducer<ErrorState, any> {
    const initialState : ErrorState = reduxes.reduce((acc, cur) => {
        return { ...acc, [cur.actions.BASE_NAME]: null }
    }, {});
    return function (state = initialState, action) {

        const { type, payload } = action;
        if (type === CLEAR_ALL_ERRORS_SUCCESS) {
            return initialState
        }

        if (type === CLEAR_SPECIFIC_ERROR && state[payload]) {
            return {
                ...state, 
                [payload]: null, 
            }
        }

        const matches = /(.*)_(REQUEST|FAILURE)/.exec(type);
        if (!matches) return state;

        const [, requestName, requestState] = matches;
        return {
            ...state,
            [requestName]: requestState === 'FAILURE' ? payload : null,
        };

    }
}
/**
 * The loading flag reducer
 * Only needs to be called once
 * 
 * For the given list of reduxes, it will instantiate them with false. 
 * @param {*} reduxes 
 */


export function createLoadingFlagReducer(reduxes : ReduxStoryLine<any, any, any, any>[]) : ReduxReducer<LoadingState, any> {

    console.log(reduxes);
    const initialState = reduxes.reduce((acc, cur) => {
        console.log(cur);
        return { ...acc, [cur.actions.BASE_NAME]: false }
    }, {});

    return function (state = initialState, action) {
        
        const { type } = action;
        if (type === RESET_LOADING_ACTION) {
            return initialState; 
        }
        const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);
        if (!matches) return state;

        const [, requestName, requestState] = matches;
        return {
            ...state,
            [requestName]: requestState === 'REQUEST',
        }

    }
};


export function clearAllLoading() {
    return {
        type: RESET_LOADING_ACTION, 
        payload: null, 
    }
}

export function createLoadingFlagReducerFromStories(stories: ReduxStory<any, object>[]) : ReduxReducer<LoadingState, any>{
    return createLoadingFlagReducer(unpackStoriesIntoStoryLines(stories)); 
}


export function createErrorReducerFromStories(stories: ReduxStory<any, object>[]) : ReduxReducer<ErrorState, any> {
    return createErrorReducer(unpackStoriesIntoStoryLines(stories)); 
}