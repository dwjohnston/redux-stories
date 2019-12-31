import { createActor } from "./createActor"

describe("createActor", () => {


    const fakeApiCall = (payload: string) => Promise.resolve(Math.random()); 
    const actor = createActor("test", fakeApiCall); 
    it ("defines a saga", () => {
        expect(actor.saga).toBeDefined();         
    })

    it ("the saga works correctly", async () => {
        const saga = actor.saga; 

        const gen = saga(actor.createAction("hello")); 
        const result = gen.next(); 
        expect(result.value.type).toBe("CALL"); 
        expect(result.value.payload.fn).toBe(fakeApiCall); 
        expect(result.value.payload.args[0]).toBe("hello"); 
    }); 
})