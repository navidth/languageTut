import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { latestCompletedSubmissionsByTest } from "@/lib/presentation/exam";
import { getApiErrorMessage, toApiErrorInfo } from "@/lib/services/apiErrors";
import { coursesApi } from "@/lib/services/coursesApi";
import { studentApi } from "@/lib/services/studentApi";
import { isCacheFresh } from "@/lib/utils/cache";
import { loadMe, login, logout, register } from "@/store/authSlice";
import { activateCourse } from "@/store/coursesSlice";
import {
  failedEntry,
  failedPage,
  loadedEntry,
  loadedPage,
  markStale,
  pendingEntry,
  pendingPage,
  shouldFetch,
} from "@/store/entries";
import type { Paginated } from "@/types/api";
import type { Course } from "@/types/course";
import type {
  ExamSubmission,
  PracticeTest,
  PracticeTestAttempt,
  PracticeTestSubmitRequest,
} from "@/types/exam";
import type {
  PageRequest,
  StudentDetailThunkConfig,
  StudentState,
  StudentThunkConfig,
} from "@/types/store";
import type {
  CourseProgress,
  Enrollment,
  MyProgress,
  StudentResource,
  StudentResourceKind,
} from "@/types/student";

const OVERVIEW_ERROR = "دریافت اطلاعات داشبورد ناموفق بود.";
const RESOURCE_ERROR = "دریافت اطلاعات از سرور ناموفق بود.";
const ENROLLED_ERROR = "دریافت دوره‌های ثبت‌نام‌شده ناموفق بود.";
const EXAM_SUBMISSIONS_ERROR = "دریافت نتایج آزمون‌ها ناموفق بود.";
const TEST_DETAIL_ERROR = "دریافت اطلاعات آزمون ناموفق بود.";
const COURSE_PROGRESS_ERROR = "دریافت پیشرفت دوره ناموفق بود.";
const START_TEST_ERROR = "شروع آزمون ناموفق بود. دوباره تلاش کنید.";
const SUBMIT_TEST_ERROR = "ثبت نهایی آزمون ناموفق بود. دوباره تلاش کنید.";
const START_LESSON_ERROR = "شروع درس ناموفق بود.";
const COMPLETE_LESSON_ERROR = "ثبت تکمیل درس ناموفق بود.";

const emptyProgress: MyProgress = { courses: [], lessons: [] };

const initialState: StudentState = {
  overview: {
    progress: emptyProgress,
    enrollmentCount: 0,
    status: "idle",
    error: null,
    lastFetched: null,
  },
  enrollmentPages: {},
  enrolledCoursePages: {},
  resources: { levels: {}, lessons: {}, questions: {}, tests: {} },
  examSubmissions: {
    items: [],
    status: "idle",
    error: null,
    errorKind: null,
    lastFetched: null,
  },
  testDetails: {},
  courseProgress: {},
};

function resourceRequest(kind: StudentResourceKind, page: number) {
  switch (kind) {
    case "levels":
      return studentApi.levels(page);
    case "lessons":
      return studentApi.lessons(page);
    case "questions":
      return studentApi.questions(page);
    case "tests":
      return studentApi.tests(page);
  }
}

export const fetchStudentOverview = createAsyncThunk<
  { progress: MyProgress; enrollments: Paginated<Enrollment> },
  { force?: boolean } | undefined,
  StudentThunkConfig
>(
  "student/overview",
  async (_, api) => {
    try {
      const [progress, enrollments] = await Promise.all([
        studentApi.progress(),
        studentApi.enrollments(1),
      ]);
      return { progress, enrollments };
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, OVERVIEW_ERROR));
    }
  },
  {
    condition: (request, { getState }) => shouldFetch(getState().student.overview, request?.force),
  },
);

export const fetchStudentResource = createAsyncThunk<
  { kind: StudentResourceKind; page: number; data: Paginated<StudentResource> },
  { kind: StudentResourceKind } & PageRequest,
  StudentThunkConfig
>(
  "student/resource",
  async ({ kind, page }, api) => {
    try {
      const data = await resourceRequest(kind, page);
      return { kind, page, data: data as Paginated<StudentResource> };
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, RESOURCE_ERROR));
    }
  },
  {
    condition: ({ kind, page, force }, { getState }) =>
      shouldFetch(getState().student.resources[kind][page], force),
  },
);

export const fetchEnrolledCourses = createAsyncThunk<
  { page: number; enrollments: Paginated<Enrollment>; courses: Paginated<Course> },
  PageRequest,
  StudentThunkConfig
>(
  "student/enrolledCourses",
  async ({ page }, api) => {
    try {
      const cachedEnrollments = api.getState().student.enrollmentPages[page];
      const enrollments = isCacheFresh(cachedEnrollments?.lastFetched) && cachedEnrollments.data
        ? cachedEnrollments.data
        : await studentApi.enrollments(page);
      const knownCourses = new Map(
        Object.values(api.getState().courses?.pages ?? {})
          .flatMap((entry) => entry.data?.results ?? [])
          .map((course) => [course.id, course]),
      );
      const missingIds = [...new Set(
        enrollments.results
          .map((enrollment) => enrollment.course)
          .filter((courseId) => !knownCourses.has(courseId)),
      )];
      const fetchedCourses = await Promise.all(missingIds.map((courseId) => coursesApi.get(courseId)));
      fetchedCourses.forEach((course) => knownCourses.set(course.id, course));
      const courses = enrollments.results
        .map((enrollment) => knownCourses.get(enrollment.course))
        .filter((course): course is Course => Boolean(course));
      return { page, enrollments, courses: { ...enrollments, results: courses } };
    } catch (error) {
      return api.rejectWithValue(getApiErrorMessage(error, ENROLLED_ERROR));
    }
  },
  {
    condition: ({ page, force }, { getState }) =>
      shouldFetch(getState().student.enrolledCoursePages[page], force),
  },
);

export const fetchExamSubmissions = createAsyncThunk<
  ExamSubmission[],
  { force?: boolean } | undefined,
  StudentDetailThunkConfig
>(
  "student/examSubmissions",
  async (_, api) => {
    try {
      return await studentApi.mySubmissions();
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, EXAM_SUBMISSIONS_ERROR));
    }
  },
  {
    condition: (request, { getState }) => shouldFetch(getState().student.examSubmissions, request?.force),
  },
);

export const fetchPracticeTestDetail = createAsyncThunk<
  PracticeTest,
  { id: number; force?: boolean },
  StudentDetailThunkConfig
>(
  "student/practiceTestDetail",
  async ({ id }, api) => {
    try {
      return await studentApi.test(id);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, TEST_DETAIL_ERROR));
    }
  },
  {
    condition: ({ id, force }, { getState }) => shouldFetch(getState().student.testDetails[id], force),
  },
);

/**
 * Starts an attempt (the server returns a running one instead of opening a
 * second), then reads the test again for its questions and deadline.
 */
export const startPracticeTest = createAsyncThunk<
  { started: PracticeTestAttempt; detail: PracticeTest },
  number,
  StudentDetailThunkConfig
>("student/startPracticeTest", async (id, api) => {
  try {
    const started = await studentApi.startTest(id);
    return { started, detail: await studentApi.test(id) };
  } catch (error) {
    return api.rejectWithValue(toApiErrorInfo(error, START_TEST_ERROR));
  }
});

export const submitPracticeTest = createAsyncThunk<
  PracticeTestAttempt,
  { id: number; data: PracticeTestSubmitRequest },
  StudentDetailThunkConfig
>("student/submitPracticeTest", async ({ id, data }, api) => {
  try {
    return await studentApi.submitTest(id, data);
  } catch (error) {
    return api.rejectWithValue(toApiErrorInfo(error, SUBMIT_TEST_ERROR));
  }
});

export const fetchCourseProgress = createAsyncThunk<
  CourseProgress,
  { courseId: number; force?: boolean },
  StudentDetailThunkConfig
>(
  "student/courseProgress",
  async ({ courseId }, api) => {
    try {
      return await studentApi.courseProgress(courseId);
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, COURSE_PROGRESS_ERROR));
    }
  },
  {
    condition: ({ courseId, force }, { getState }) =>
      shouldFetch(getState().student.courseProgress[courseId], force),
  },
);

export const startLesson = createAsyncThunk<number, number, StudentDetailThunkConfig>(
  "student/startLesson",
  async (lessonId, api) => {
    try {
      await studentApi.startLesson(lessonId);
      return lessonId;
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, START_LESSON_ERROR));
    }
  },
);

export const completeLesson = createAsyncThunk<number, number, StudentDetailThunkConfig>(
  "student/completeLesson",
  async (lessonId, api) => {
    try {
      await studentApi.completeLesson(lessonId);
      return lessonId;
    } catch (error) {
      return api.rejectWithValue(toApiErrorInfo(error, COMPLETE_LESSON_ERROR));
    }
  },
);

/** Progress figures change after a lesson is started or completed. */
function invalidateProgress(state: StudentState) {
  state.overview.lastFetched = null;
  markStale(state.courseProgress);
  markStale(state.resources.lessons);
}

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    /** Marks the cached exam history stale, e.g. after a test is submitted. */
    invalidateExamSubmissions(state) {
      state.examSubmissions.lastFetched = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStudentOverview.pending, (state) => {
        state.overview.status = "loading";
        state.overview.error = null;
      })
      .addCase(fetchStudentOverview.fulfilled, (state, action) => {
        const fetchedAt = Date.now();
        state.overview = {
          progress: action.payload.progress,
          enrollmentCount: action.payload.enrollments.count,
          status: "succeeded",
          error: null,
          lastFetched: fetchedAt,
        };
        state.enrollmentPages[1] = loadedPage(action.payload.enrollments, fetchedAt);
      })
      .addCase(fetchStudentOverview.rejected, (state, action) => {
        state.overview.status = "failed";
        state.overview.error = String(action.payload ?? OVERVIEW_ERROR);
      })
      .addCase(fetchStudentResource.pending, (state, action) => {
        const { kind, page } = action.meta.arg;
        state.resources[kind][page] = pendingPage(state.resources[kind][page]);
      })
      .addCase(fetchStudentResource.fulfilled, (state, action) => {
        const { kind, page, data } = action.payload;
        state.resources[kind][page] = loadedPage(data);
      })
      .addCase(fetchStudentResource.rejected, (state, action) => {
        const { kind, page } = action.meta.arg;
        state.resources[kind][page] = failedPage(
          state.resources[kind][page],
          String(action.payload ?? RESOURCE_ERROR),
        );
      })
      .addCase(fetchEnrolledCourses.pending, (state, action) => {
        const { page } = action.meta.arg;
        state.enrolledCoursePages[page] = pendingPage(state.enrolledCoursePages[page]);
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        const { page, enrollments, courses } = action.payload;
        const fetchedAt = Date.now();
        state.enrollmentPages[page] = loadedPage(enrollments, fetchedAt);
        state.enrolledCoursePages[page] = loadedPage(courses, fetchedAt);
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        const { page } = action.meta.arg;
        state.enrolledCoursePages[page] = failedPage(
          state.enrolledCoursePages[page],
          String(action.payload ?? ENROLLED_ERROR),
        );
      })
      .addCase(fetchExamSubmissions.pending, (state) => {
        state.examSubmissions.status = "loading";
        state.examSubmissions.error = null;
        state.examSubmissions.errorKind = null;
      })
      .addCase(fetchExamSubmissions.fulfilled, (state, action) => {
        state.examSubmissions = {
          items: action.payload,
          status: "succeeded",
          error: null,
          errorKind: null,
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchExamSubmissions.rejected, (state, action) => {
        state.examSubmissions.status = "failed";
        state.examSubmissions.error = action.payload?.message ?? EXAM_SUBMISSIONS_ERROR;
        state.examSubmissions.errorKind = action.payload?.kind ?? "unknown";
      })
      .addCase(fetchPracticeTestDetail.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.testDetails[id] = pendingEntry(state.testDetails[id]);
      })
      .addCase(fetchPracticeTestDetail.fulfilled, (state, action) => {
        state.testDetails[action.meta.arg.id] = loadedEntry(action.payload);
      })
      .addCase(fetchPracticeTestDetail.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.testDetails[id] = failedEntry(state.testDetails[id], action.payload, TEST_DETAIL_ERROR);
      })
      .addCase(startPracticeTest.fulfilled, (state, action) => {
        state.testDetails[action.meta.arg] = loadedEntry(action.payload.detail);
      })
      .addCase(submitPracticeTest.fulfilled, (state, action) => {
        // The exam history and progress do not include this attempt yet.
        state.examSubmissions.lastFetched = null;
        state.overview.lastFetched = null;
        const entry = state.testDetails[action.meta.arg.id];
        if (entry) entry.lastFetched = null;
      })
      .addCase(fetchCourseProgress.pending, (state, action) => {
        const { courseId } = action.meta.arg;
        state.courseProgress[courseId] = pendingEntry(state.courseProgress[courseId]);
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.courseProgress[action.meta.arg.courseId] = loadedEntry(action.payload);
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        const { courseId } = action.meta.arg;
        state.courseProgress[courseId] = failedEntry(
          state.courseProgress[courseId],
          action.payload,
          COURSE_PROGRESS_ERROR,
        );
      })
      .addCase(startLesson.fulfilled, invalidateProgress)
      .addCase(completeLesson.fulfilled, invalidateProgress)
      .addCase(activateCourse.fulfilled, (state) => {
        // A new enrollment changes the dashboard and the enrolled courses.
        state.overview.lastFetched = null;
        markStale(state.enrollmentPages);
        markStale(state.enrolledCoursePages);
      })
      .addCase(logout, () => initialState)
      .addCase(loadMe.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState);
  },
});

export const { invalidateExamSubmissions } = studentSlice.actions;

/** Latest finished attempt per practice test, keyed by the test id. */
export const selectLatestExamSubmissions = createSelector(
  [(state: { student: StudentState }) => state.student.examSubmissions.items],
  latestCompletedSubmissionsByTest,
);

export const selectCourseProgress = (state: { student: StudentState }, courseId: number) =>
  state.student.courseProgress[courseId];

export default studentSlice.reducer;
