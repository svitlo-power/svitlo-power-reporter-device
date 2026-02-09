import { type Action, combineReducers } from "redux";
import { appReducer, wifiReducer } from "./slices";

const combinedReducer = combineReducers({
  ['app']: appReducer,
  ['wifi']: wifiReducer,
});

type RootState = ReturnType<typeof combinedReducer>;

export const rootReducer = (state: RootState | undefined, action: Action) => {
  return combinedReducer(state, action);
};
