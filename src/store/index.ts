import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import courses from "./coursesSlice";

export const makeStore = () => configureStore({ reducer: { auth, courses } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
