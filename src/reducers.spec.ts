import { createCreateClobberReducer } from "./reducers";
import { createActionBundle } from "./createActor";

describe("createCreateClobberReducer", () => {

    const actionBundle = createActionBundle("TEST"); 
    const createClobberReducer = createCreateClobberReducer(actionBundle); 

    const clobberReducer = createClobberReducer({}); 

    it ("clobbers correctly", () => {
        const result = clobberReducer(undefined, {
            type: actionBundle.UPDATE, 
            payload: "test"
        }); 
        expect (result).toEqual("test"); 
    })

    it ("other actions won't do anything", () => {
        const result = clobberReducer("test", {
            type: actionBundle.FAILURE, 
            payload: "sdfsdf"
        }); 
        expect (result).toEqual("test"); 
    })

    it ("reset will reset to the initial state", () => {
        const result = clobberReducer("test", {
            type: actionBundle.RESET, 
            payload: undefined
        }); 
        expect (result).toEqual({}); 
    })
})