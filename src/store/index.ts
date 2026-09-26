import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import courses from "./coursesSlice";
import skills from "./skillsSlice";
import student from "./studentSlice";

export const makeStore = () =>
  configureStore({ reducer: { auth, courses, skills, student } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
