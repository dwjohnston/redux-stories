import { createActor } from "./createActor"
import { CallEffectDescriptor } from "redux-saga/effects";

describe("createActor", () => {


    const fakeApiCall = (payload: string) => Promise.resolve(Math.random());
    const actor = createActor("test", fakeApiCall);
    it("defines a saga", () => {
        expect(actor.saga).toBeDefined();
    })

    

    it("the saga works correctly", async () => {
        const saga = actor.saga;
        const gen = saga(actor.createAction("hello"));
        const result = gen.next();
        expect(result.value.type).toBe("CALL");
        expect((result.value.payload as CallEffectDescriptor<any>).fn).toBe(fakeApiCall);
        expect((result.value.payload as CallEffectDescriptor<any>).args[0]).toBe("hello");
    });


    it ("defines create/cancel/reset/clear errors actions", () => {
        expect(actor.cancelAction).toBeDefined(); 
        expect(actor.resetAction).toBeDefined(); 
        expect(actor.createAction).toBeDefined(); 
        expect(actor.clearErrorsAction).toBeDefined(); 

        //@ts-ignore - this one is working
        actor.createAction(999); 

        
    })
})