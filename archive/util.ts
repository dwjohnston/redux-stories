import { ReduxStoryLine, ReduxStory,  ReduxAction } from "./baseTypes";
import { requestClearAllErrors, clearAllLoading } from "./errorAndLoading";

function defaultUnpackCondition (sl: ReduxStoryLine<any, any, any, any>) {
    return true; 
}

export function unpackStoriesIntoStoryLines<S, K>(
    stories: ReduxStory<S, K>[],
    condition: (sl: ReduxStoryLine<any, any, any, any>) => boolean = defaultUnpackCondition
): ReduxStoryLine<any, any, any, any>[] {
    return stories.reduce((a, c) => {
        return [
            ...a,
            ...Object.values(c.reduxes)
        ]
    }, []).filter(v => condition(v));
}



export function resetAll(dispatch: (action: ReduxAction<void>)  => void, storys: ReduxStory<any, any>[]){
    const lines = unpackStoriesIntoStoryLines(storys); 
    lines.forEach(v => dispatch(v.resetFn())); 

    dispatch(requestClearAllErrors())
    dispatch(clearAllLoading()); 
}


