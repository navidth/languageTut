import { configureStore } from "@reduxjs/toolkit";
import auth from "@/store/authSlice";
import courses from "@/store/coursesSlice";
import homework from "@/store/homeworkSlice";
import skills from "@/store/skillsSlice";
import student from "@/store/studentSlice";

export const makeStore = () =>
  configureStore({ reducer: { auth, courses, homework, skills, student } });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
