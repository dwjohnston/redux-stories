
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { createRootReducer, createRootSaga } from "../createRoot";
import { createActor } from "../createActor";
import { createStory } from "../createStory";


describe("the whole thing works", () => {

    //Create our 'api calls'
    const fakeFetchUser = () => "fakeUser";
    const fakeUpdateuser = (id: string) => id;
    const fakeFetchTeacher = () => "fakeTeacher";

    //Create our stories
    const userStory = createStory("user", {}, {
        fetchUser: createActor(
            "fetchUser",
            fakeFetchUser
        ),
        updateUser: createActor(
            "updateUser",
            fakeUpdateuser
        )
    });

    const teacherStory = createStory("teacher", {

    }, {
        fetchTeacher: createActor(
            "fetchTeacher",
            fakeFetchTeacher
        )
    });


    //Create the root reducer
    const rootReducer = createRootReducer([
        userStory,
        teacherStory
    ]);

    //Create the root saga
    const rootSaga = createRootSaga([
        userStory, 
        teacherStory
    ])

    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );

    sagaMiddleware.run(rootSaga);

    it("all create actions work ok", () => {
        store.dispatch(userStory.actors.fetchUser.createAction(undefined)); 
        expect(store.getState().user).toBe("fakeUser"); 

        store.dispatch(userStory.actors.updateUser.createAction("aaaa")); 
        expect(store.getState().user).toBe("aaaa");

        store.dispatch(teacherStory.actors.fetchTeacher.createAction(undefined));
        expect(store.getState().teacher).toBe("fakeTeacher");
        expect(store.getState().user).toBe("aaaa");
    })
})