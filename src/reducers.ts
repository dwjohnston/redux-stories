import { ReducerCreator, ActionBundle, ReduxAction, PayloadType, StateType } from "./baseTypes";

export function createCreateClobberReducer<
    S extends StateType,
    Q extends PayloadType
>(actionBundle: ActionBundle): ReducerCreator<S, Q> {
    return (
        initialState: S,
    ) => (state = initialState, action: ReduxAction<Q>) => {

        if (action.type === actionBundle.UPDATE) {

            return action.payload as unknown as S;
        }

        if (action.type === actionBundle.RESET) {
            return initialState;
        }
        return state;
    }
}