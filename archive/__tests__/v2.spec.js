import { createGenericCombinedReduxOnSingleReducer, clobberReducer } from "../index";



describe("Sanity tests", () => {
    const result =  createGenericCombinedReduxOnSingleReducer("r1", {
        action1: {
            baseName: "ACTION_ONE",                 
        }
    });    

    it ("it doesn't error", () => { 
        expect(true).toBeTruthy(); 
    })
    

    it ("contains a single reducer", () => {
        expect (result.reducer).toBeDefined(); 
    }); 

    it ("The reducer works", () => {
        expect(() => result.reducer({}, {})).not.toThrow(); 
    });


}); 

describe("Default, multiple action tests", () => {
    const result =  createGenericCombinedReduxOnSingleReducer("r1", {
        action1: {
            baseName: "ACTION_ONE",
            reducerFn: clobberReducer(),                  
        }, 
        action2: {
            baseName: "ACTION_TWO", 
            reducerFn: clobberReducer(), 
        }
    });    
  
    it ("contains a single reducer", () => {
        expect (result.reducer).toBeDefined(); 
    }); 

    it ("contains two sagas", () => {
        expect (result.sagas.length).toBe(2);
    }); 

    it ("it contains two 'reduxes'", () => {
        expect (result.reduxes.action1).toBeDefined(); 
        expect(result.reduxes.action2).toBeDefined(); 
    }); 

    it ("Both actions types trigger a state change", () => {

        const reducer = result.reducer; 

        const actionFn1 = result.reduxes.action1.actionFn; 
        const actionFn2 = result.reduxes.action2.actionFn; 

        const resulta = reducer({}, {
            type: result.reduxes.action1.actions.SUCCESS, 
            payload: "hello",
        }); 

        const resultb = reducer({}, {
            type: result.reduxes.action2.actions.SUCCESS, 
            payload: "world", 
        }); 

        expect(resulta).toBe("hello"); 
        expect(resultb).toBe("world"); 

    }); 

    it ("in default behaviour, store shape is flat, and clobbers", () => {
        const reducer = result.reducer; 

        const resultb = reducer({foo: "bar"}, {
            type: result.reduxes.action2.actions.SUCCESS, 
            payload: {
                bar: "foo"
            }
        }); 

        expect(resultb).toEqual({bar:"foo"}); 
    }); 

}); 

