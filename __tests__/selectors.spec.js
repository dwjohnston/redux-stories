import { createIsPendingSelector, createDefaultDataSelector } from "..";
import { exportAllDeclaration } from "@babel/types";

describe("createDefaultDataSelector", () => {
    it("returns falsy if undefined", () => {
        const selector = createDefaultDataSelector("foo"); 
        expect (selector({})).toBeFalsy(); 
    })


    it("returns falsey if {}", () => {
        const selector = createDefaultDataSelector("foo"); 
        expect (selector({foo: {}})).toBeFalsy();
    })

    it("returns truthy  if {data: 'a'}", () => {
        const selector = createDefaultDataSelector("foo"); 
        expect (selector({foo: {data: 'a'}})).toBeTruthy();
    })

})

describe("createIsPendingSelector", () => {
    it("expects actionBundles and dataSelector at a minimum - error case", () => {
        const actionBundles = {
            BASE_NAME: "FOO"
        };
        const dataSelector = null;
        const selector = createIsPendingSelector([actionBundles], dataSelector);
        expect(() => selector({})).toThrow();
    })

    it("expects actionBundles and dataSelector at a minimum - clean case", () => {

        const actionBundles = {
            BASE_NAME: "FOO"
        };

        const dataSelector = () => true;

        const selector = createIsPendingSelector([actionBundles], dataSelector);

        expect(() => selector({})).not.toThrow();
    })

    it("if there is data, it returns false", () => {
        const actionBundles = {
            BASE_NAME: "FOO"
        };

        const dataSelector = () => true;

        const selector = createIsPendingSelector([actionBundles], dataSelector);

        expect(selector({})).toBe(false);
    });


    it("if there is not data, and it is loading, return false", () => {
        const actionBundles = {
            BASE_NAME: "FOO"
        };

        const dataSelector = () => false;

        const selector = createIsPendingSelector([actionBundles], dataSelector);

        expect(selector({
            loading: { "FOO": true },
            error: {},
        })).toBe(false);
    });

    it("if there is not data, and no errors or loading, return true", () => {
        const actionBundles = {
            BASE_NAME: "FOO"
        };

        const dataSelector = () => false;

        const selector = createIsPendingSelector([actionBundles], dataSelector);

        expect(selector({
            loading: { "FOO": false },
            error: { "FOO": false },
        })).toBe(true);
    });
})