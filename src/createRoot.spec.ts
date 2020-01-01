import { createStory } from "./createStory"
import { createActor } from "./createActor"
import { createRootReducer } from "./createRoot";

describe("createRootReducer", () => {


    const fakeFetchUser = () => "fakeUser";
    const fakeUpdateuser = (id: string) => id;
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

    const fakeFetchTeacher = () => "fakeTeacher";
    const teacherStory = createStory("teacher", {

    }, {
        fetchTeacher: createActor(
            "fetchTeacher",
            fakeFetchTeacher
        )
    });

    const rootReducer = createRootReducer([
        userStory,
        teacherStory
    ]);



    it("creates a single reducer for each story", () => {
        expect(typeof rootReducer).toBe("function")

        const result = rootReducer(undefined, {
            type: "foo"
        });
        expect(result.teacher).toBeDefined();
        expect(result.user).toBeDefined();
    });


    it("the reducers work correctly", () => {

        const result1 = rootReducer(undefined, {
            type: userStory.actors.fetchUser.actions.UPDATE,
            payload: "fakeUser",
        });
        expect(result1.user).toBe("fakeUser");

        const result2 = rootReducer(result1, {
            type: userStory.actors.updateUser.actions.UPDATE,
            payload: "test",
        });
        expect(result2.user).toBe("test");

        const result3 = rootReducer(result2, {
            type: teacherStory.actors.fetchTeacher.actions.UPDATE,
            payload: "teacher",
        });

        expect(result3.teacher).toBe("teacher");


        expect(result3.user).toBe("test");
    });


})