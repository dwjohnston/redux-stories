import { DEFAULT_LOADING_REDUCER_NAME, DEFAULT_ERROR_REDUCER_NAME } from "./main";
import {  ReduxStory, ActionBundle, DataSelector, LoadingState, ErrorState, StoryLineStatus, ErrorPackage, DataSelectorCreator } from "./baseTypes";
import { unpackStoriesIntoStoryLines } from "./util";

//Duplication with error and loading? 
export const createAnyLoadingSelectorFromReduxes = (
    reduxes: ReduxStory<any, object>[]
): DataSelector<LoadingState, boolean> => {
    const storyLines = unpackStoriesIntoStoryLines(reduxes).filter(storyLine => storyLine.showLoadingCursor);
    const actionBundles = storyLines.map(v => v.actions);
    return createAnyLoadingSelector(actionBundles)
}

export const createAnyErrorSelectorFromReduxes = (
    reduxes: ReduxStory<any, any>[]
): DataSelector<ErrorState, ErrorPackage> => {
    const storyLines = unpackStoriesIntoStoryLines(reduxes).filter(storyLine => storyLine.showError);
    const actionBundles = storyLines.map(v => v.actions);
    return createAnyErrorSelector(actionBundles)
}

export const createAnyLoadingSelector = (
    actionBundles: ActionBundle[],
    loadingReducerName = DEFAULT_LOADING_REDUCER_NAME
): DataSelector<any, boolean> => {      //Warn, assumes that the state object has the loading reducer

    const requests = actionBundles.map(v => v.BASE_NAME);
    return (state: object) => {
        return requests.reduce((acc, cur) => {
            console.log(acc);
            return !!state[loadingReducerName][cur] || acc; //Any true
        }, false);
    }
}


//todo, possibly delete
export const createIsPendingSelector = (
    actionBundles,
    dataSelector,
    loadingReducerName = DEFAULT_LOADING_REDUCER_NAME,
    errorReducerName = DEFAULT_ERROR_REDUCER_NAME) => {
    const requests = actionBundles.map(v => v.BASE_NAME);
    return (state, ...args) => {

        const data = dataSelector(state, ...args);
        console.log(data);
        if (data) {
            return false;
        }
        return requests.reduce((acc, cur) => {
            return !((state[loadingReducerName][cur] || state[errorReducerName][cur]) && acc); //Any true, and invert
        }, true);
    }
}


export const createAnyErrorSelector = (
    actionBundles: ActionBundle[],
    errorReducerName = DEFAULT_ERROR_REDUCER_NAME
): DataSelector<ErrorState, any> => {
    const requests = actionBundles.map(v => v.BASE_NAME);
    return (state: object) => {
        return requests.reduce((acc, cur) => {
            const value  = state[errorReducerName][cur];  
            return [...acc, value];  //Any true
        }, []).filter(v => v!==null);
    }//Reuse. 
}

export function createSelectByIdSelector<S, T>(baseSelector: DataSelector<S, T>) {
    return (state: S, id: string): DataSelector<S, T> => {
        return baseSelector(state)[id];
    }
}

//TODO, are we still using?
export const createCombinedEveryDataSelector = (selectors, doesExistFn = defaultDoesExist) => {
    return (state, arrayOfArgArrays = []) => {
        const data = selectors.map((selector, i) => {
            const args = arrayOfArgArrays[i] || [];
            return selector(state, ...args);
        });

        return data.every(v => doesExistFn(v)) ? data : false;
    }
}


//TODO  are we still using? 
function defaultDoesExist(data) {
    return !!data;
}

export const createCombinedAnyDataSelector = (selectors, doesExistFn = defaultDoesExist) => {
    return (state, arrayOfArgArrays = []) => {
        const data = selectors.map((selector, i) => {
            const args = arrayOfArgArrays[i] || [];
            return selector(state, ...args);
        }).filter(v => doesExistFn(data));

        return data.length > 1 ? data : false;
    }
}


//Pretty sure we can delete this. 
export function createStateSelector<S, T>(
    actionBundles: ActionBundle[],
    dataSelector: DataSelector<S, T>,
    loadingReducerName = DEFAULT_LOADING_REDUCER_NAME,
    errorReducerName = DEFAULT_ERROR_REDUCER_NAME
) {

    const isPendingSelector = createIsPendingSelector(actionBundles, dataSelector, loadingReducerName, errorReducerName);
    const isLoadingSelector = createAnyLoadingSelector(actionBundles, loadingReducerName);
    const isErrorSelector = createAnyErrorSelector(actionBundles, errorReducerName);

    return (state: S, ...args: any) => {
        const data = dataSelector(state, ...args);
        const things = {
            isPending: isPendingSelector(state, ...args),
            isLoading: isLoadingSelector(state),
            isError: isErrorSelector(state),

        }

        console.log(things, data);
        return {
            ...things,
            isSuccess: !things.isPending && !things.isLoading && !things.isError,
            data,
        }
    }
}


export function createStatusSelector<S, Q>(
    dataSelector: DataSelector<S, Q>,
    isLoadingSelector: DataSelector<LoadingState, boolean>,
    errorSelector: DataSelector<ErrorState, ErrorPackage>
): (state: any) => StoryLineStatus<Q> {

    return (state: any) => {

        const data = dataSelector(state);
        const errorMessage = errorSelector(state);
        const isLoading = isLoadingSelector(state);

        return {
            isLoading: isLoading,
            isPending: !data && !isLoading && !errorMessage,
            isResolved: !!data || !!errorMessage,

            isError: !!errorMessage,
            isSuccess: !!data,

            data: data,
            error: errorMessage,
        };
    };
}


export function createDefaultDataSelector<S, Q>(reducerName: string): (state: S) => Q  {
    return (state: S) => {
        const data = state[reducerName];
        if (!data || Object.entries(data).length === 0) {
            return null;
        }
        return data as Q;
    }
};


export const createGetArrayFromIndexedObjectDataSelector = function () {
    return (reducerName: string) => {
        return (state: object) => {
            return Object.values(state[reducerName]);
        }
    }
}

//Can probably delete this. 
export const allowEmptyObjectDataSelector = (reducerName) => (state) => {
    return state[reducerName];
}

export const onlyExistsIfFieldNameDataSelector = (fieldName = "id") =>
    (reducerName: string) =>
        (state: object) => {
            const data = state[reducerName];
            if (!data) {
                return data;
            }
            if (data[fieldName]) {
                return data;
            } else {
                return null;
            }
        }
