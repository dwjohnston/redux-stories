import { createStory } from "./createStory"
import { createActor } from "./createActor"

describe("Create story", () => {

    const fakeApiCallSingle = (id: string) => Promise.resolve(Math.random + "");
    const fakeApiCallMulti = () => Promise.resolve(new Array(5).fill(true).map(v => Math.random() + "")); 


    const story = createStory(
        "users", 
        {}, 
        {
            fetchUser: createActor("FETCH_USER",fakeApiCallSingle), 
            fetchUsers: createActor("FETCH_USERS", fakeApiCallMulti), 
        }
    ); 
    it ("All Actor and their actions are defined", () => {
        
        expect(story.actors.fetchUser).toBeDefined(); 
        expect(story.actors.fetchUsers).toBeDefined(); 

        const createFetchUserAction = story.actors.fetchUser.createAction("aaa"); 
        expect(createFetchUserAction.type).toEqual("FETCH_USER_REQUEST"); 
        expect(createFetchUserAction.payload).toEqual("aaa")       

    }); 


    it ("The action functions match the signatures of the API calls I passed in", () => {
      
        //@ts-ignore - this is working
        const createFetchUserAction = story.actors.fetchUser.createAction(999); 
         
    })
})