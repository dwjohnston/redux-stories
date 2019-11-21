/**
 * Generic Types: 
 * 
 * S = State 
 * P = Payload for action
 * Q = Payload of success action
 * T = Result of a dataSelector function. 
 */
export interface ActionBundle {
    BASE_NAME: string;
    REQUEST: string;
    SUCCESS: string;
    FAILURE: string;
    RESET: string;
    CANCEL: string;
    CANCELLED: string;
    UPDATE: string;
}

export interface DataFetchFunction<P, Q> {
    (data: P): Promise<Q>;
}

export interface ErrorPackage {
    message: string;
    rest?: any;
}


export interface ReduxAction<P> {
    type: string;
    payload: P;
}

export interface ReduxReducer<S, P> {
    (state: S, action: ReduxAction<P>): S;
}


export interface ReduxSaga<P, Q> {
    (action: ReduxAction<P>): Iterable<any>;
}


export interface StoryOptions<S> {
    combineReducersFn?: (...any: any) => any; //todo
    initialState?: S;

}



export interface StoryConfigs<S> {
    [key: string]: StoryLineOptions<S, any, any, any>;
}

export type StoryLines<S, K> = {
    [key in keyof K]: ReduxStoryLine<S, any, any, any>
};

//nb. A story is composed of multiple reducers of any type, 
//To make a single reducer of type T. 
export interface ReduxStory<S, K> {
    reducerName: string;
    reducer: ReduxReducer<S, any>;
    sagas: SagaWatcher[],
    reduxes: StoryLines<S, K>,
    dataSelector: DataSelector<S, S>

};

export interface ErrorState {
    [key: string]: any;
}



export interface LoadingState {
    [key: string]: boolean;
}

export interface ReduxStoryLine<S, P, Q, T> {
    actions: ActionBundle;
    actionFn: ActionCreator<P>;
    cancelFn: ActionCreator<void>;
    resetFn: ActionCreator<void>;
    clearErrorsFn: ActionCreator<string>;
    saga: ReduxSaga<P, Q>;
    sagaWatcher: SagaWatcher;
    reducer: ReduxReducer<S, Q>;
    reducerName: string;
    dataSelector: DataSelector<S, T | null | undefined>;
    loadingSelector: DataSelector<LoadingState, boolean>;
    errorSelector: DataSelector<ErrorState, ErrorPackage>;

    showLoadingCursor: boolean;
    showError: boolean;
    getStatus: GetStoryLineStatusFunction<T>;
}


export interface StoryLineOptions<S, P, Q, T> {
    baseName: string;
    reducerName?: string;
    actionFnCreator?: ActionCreatorCreator<P>;
    cancelFnCreator?: ActionCreatorCreator<void>;
    sagaFn?: SagaCreator<P, Q>;
    sagaWatcherFn?: SagaWatcherCreator<P, Q>;
    initialState?: S;
    reducerFn?: ReducerCreator<S, Q>;
    dataSelectorFn?: DataSelectorCreator<S, T>;

    errorSelectorFn?: DataSelectorCreator<any, ErrorPackage>;
    loadingSelectorFn?: DataSelectorCreator<any, boolean>;

    loadingReducerName?: string;
    errorReducerName?: string;

    showLoadingCursor?: boolean;
    showError?: boolean;


}

export interface SagaWatcher {
    (): Iterable<any>
}


export interface ReducerCreator<S, P> {
    (actions: ActionBundle, initialState: S): ReduxReducer<S, P>;
}


export interface ActionCreator<P> {
    (payload?: P): ReduxAction<P>;
}


export interface ActionCreatorCreator<P> {
    (actions: ActionBundle): ActionCreator<P>;
}


export interface SagaCreator<P, Q> {
    (actions: ActionBundle): ReduxSaga<P, Q>;
}


export interface SagaWatcherCreator<P, Q> {
    (actions: ActionBundle, saga: ReduxSaga<P, Q>): SagaWatcher;
}


export interface DataSelector<S, T> {
    (state: S, ...args: any): T;
}


export interface DataSelectorCreator<S, T> {
    (reducerName: string): DataSelector<S, T | null | undefined>;
}


export interface GetStoryLineStatusFunction<Q> {
    (state: any): StoryLineStatus<Q>;

}

export interface StoryLineStatus<T> {
    isPending: boolean;
    isLoading: boolean;
    isResolved: boolean;

    //Resolved
    isSuccess: boolean;
    isError: boolean;
    //isCancelled: boolean; 

    //isSuccess
    data: T | undefined;
    //isError
    error?: ErrorPackage | undefined;

}
