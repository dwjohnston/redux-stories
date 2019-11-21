# redux-stories

Redux-stories is intended to be a composable, declarative framework to assist creating your redux actions, sagas and reducers. 

## Note on terminology 

Taking the existing terminology around redux and redux-saga

- **Action** - a plain object, typically of the form
```
 {
     type: "FETCH_DATA_REQUEST", 
     payload: {
         foo: 'bar', 
     }
 }

```

- **Action Creator** - A function that will create an action object. 
- **Saga** - A generator function that takes actions of a certain types, and then performs business logic. (eg. making an API call). See the [redux-saga documentation](https://redux-saga.js.org/docs/introduction/BeginnerTutorial.html).
- **Reducer** - A function of the following format: 
```
function (state, action) {
    //calcuate the new state based on the current state and the action
    return newState; 
}
```
A reducer function takes the current state and an action as arguments, and then returns a new state based on those two values. 

- **Selector** - A function that returns some data based on the current state. 


Redux-stories introduces the following concepts: 

⚠️ This documentation is going to use the modern naming that *isn't actually implemented*, see the table below for the actual terminology. 

ℹ️ The terminology below is a play on the term 'saga' so we're continuing with the theme and using 'story'. 

- **Story**  - A story is a collection of a single Action, Action Creator, Saga, Reducer, and Selector. ie. Everything that is needed to do related to a single API interaction or whatever. 

- **StoryBook** - A story book is a collection of stories that *share a reducer/substate*. 

- **Library** - A collection of all StoryBooks (ie. the entire state with its multiple sub states). 

eg. We have a 'fetch all students', and an 'update specific student' action. These are seperate actions, but should share the same application state area. That is, when we update the student, it should change the same part of the data that the fetch all students action created. 

Those will be two stories in the same story book. 

We also have a 'fetch teachers' action. This is seperate story in a seperate storybook. 

Both story books are in the same library. 

⚠️ Current terminology in code: 

- The above Story is a **StoryLine** or a **Redux**
- The above StoryBook is a **Story** or **Reduxes**
- There is no use of Library. 

Sorry, confusing I know. 


## Usage

Your basic usage is going to look like this: 


### 1. Create the Story
```
import {createGenericCombinedReduxOnSingleReducer,genericApiSagaCreatorFn} from "redux-stories"; 
import {fetchSingleStudent, updateSingleStudent} from "my-student-service";


//This function name should be createStoryBook
export const studentStoryBook = createGenericCombinedReduxOnSingleReducer("student", {
    fetchSingle: { //Individual stories
        baseName: "FETCH_SINGLE_STUDENT",
        sagaFn: genericApiSagaCreatorFn(fetchSingleStudent),   
   }, 
   update: { //Individual stories
        baseName: "UPDATE_SINGLE_STUDENT",
        sagaFn: genericApiSagaCreatorFn(updateSingleStudent),  
    }, 
})
```

### 2. Add the story to root saga / create root saga

```
import {createRootSaga} from "redux-stories"; 

export const rootSaga = createRootSaga([
    studentStoryBook,
    //More StoryBooks go here. 
]); 
```

### 3. Add the story to the root reducer/create root reducer

```
import {createRootReducer} from "redux-stories"; 

export const rootReducer = createRootReducer([
    studentStoryBook,
    //More StoryBooks go here. 
]); 
```


### 4. Create loading and error selectors at your application root: 

This is so you can display a loading cursor everywhere on the application, and display errors at a root level. 

(Notes below about opting out of this behaviour). 

```
import { createAnyLoadingSelectorFromReduxes, createAnyErrorSelectorFromReduxes, requestClearAllErrors, ErrorPackage } from 'redux-stories';
import {useSelector} from "react-redux"; 

const storyBooks = [
    studentStory
]
//These functions should be 
//createAnyLoadingSelector
//createAnyErrorSelector
const loadingSelector = createAnyLoadingSelectorFromReduxes(storyBooks);
const errorSelector = createAnyErrorSelectorFromReduxes(storyBooks);

export const App: FunctionComponent<AppProps> = (
  props
) => {
  const { } = props;
  const isLoading = useSelector(loadingSelector);  //Get loading from state
  const errors = useSelector(errorSelector);  //Get errors from state
  return ({

      <div> 
            {isLoading? 'Loading...' : ''}
            {errors? 'Oh no there are errors!' : 'The app is all good!'}
      </div> 
  }); 
}
```

### 5. Use the Story in a component 
```
export const App: FunctionalComponent<AppProps> = (
    props
) => {

    const dispatch = useDispatch(); 

    //The key function is `getStatus` which returns the isLoading, isError etc. 
    const status = useSelector(studentStory.reduxes.fetchSingle.getStatus); 

    //The actionFn is what triggers the action. 
    //Here it is wrapped in useCallback to memoize it. (Improved performance). 
    const fetchStudent = useCallback(() => {
        dispatch(studentStory.reduxes.fetchSingle.actionFn("studentid"))
    }, []); 

    return <div> 
         <button onClick = {fetchStudent} disabled = {status.isLoading || status.isSuccess}> fetch student </button> 

         {status.isSuccess && <p>{JSON.stringify(status.data)}</p>}
    </div>; 
}
```

## API

At this point it is better to dive into code itself. 

(Really, the API documentation should be created from the code sooo). 


The main starting points are: 

- [baseTypes](./src/baseTypes.ts) - All of the interfaces 
- [stories](./src/stories.ts) - The top level functions to create stories and storybooks
- [errorAndLoading](./src/errorAndLoading.ts) - Reducers, selectors etc, specific for error and loading. 
- [main](./src/main.ts) - Functions for creating things at a StoryLibrary level. 
- [reducers](./src/reducers.ts) - Functions for creating reducers. 
- [sagas](./src/sagas.ts) - Functions for create sagas
- [utils](./src/util.ts) - Some utility functions. 

### Composition 

The library is designed to be composable - that is - while there is a fairly opinionated default way of doing things, you can always write your own reducers, selectors etc. 

We are also providing some standard sagas, reducers and selectors out of the box. 

The way the composition works is in the creation of the `StoryLineOptions` object (should be `StoryOptions`). 

for `reducerFn` `sagaFn` and `dataSelectorFn` we pass in a function that accepts an `ActionBundle` object. 

That function will then return the reducer/saga/selector itself. 


## Actual Issues

### Generic types. 

The toplevel `StoryLineOption` and `ReduxStoryLine` objects have four generic parameters: 

- S refers to the shape of the state
- P refers to the shape of the payload that is passed to the request action
- Q refers to the shape of the payload that is the result of the action
- T refers to the shape of the data that is returned from the selector
