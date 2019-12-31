import { PayloadType, Story, Actor, StateType, ActorMap } from "./baseTypes";
import reduceReducers from "reduce-reducers";

export function createStory<S extends StateType,
    K extends ActorMap<S>
    >(
    reducerName: string,
    initialState: S,
    actors: K
): Story<S, K> {
    return {
        reducerName: reducerName,
        reducer: reduceReducers(initialState, ...Object.values(actors).map(v => v.reducerCreator(initialState))),
        sagas: Object.values(actors).map(v => v.saga),
        actors: actors,
    }
}