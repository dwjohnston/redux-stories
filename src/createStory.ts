import { PayloadType, Story, Actor, StateType, BaseActorInterface } from "./baseTypes";
import reduceReducers from "reduce-reducers";

export function createStory<S extends StateType,
    K extends Record<string, BaseActorInterface<PayloadType, PayloadType>>
    >(
    reducerName: string,
    initialState: S,
    actors: Record<keyof K, Actor<S, PayloadType, PayloadType>>
): Story<S, K> {
    return {
        reducerName: reducerName,
        reducer: reduceReducers(initialState, ...Object.values(actors).map(v => v.reducerCreator(initialState))),
        sagas: Object.values(actors).map(v => v.saga),
        actors: actors,
    }
}