import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import {
  getApiErrorMessage,
  toApiErrorInfo,
  type ApiErrorInfo,
  type ApiErrorKind,
} from "@/lib/apiErrors";
import { isCacheFresh } from "@/lib/cache";
import type { Course, Level } from "@/lib/courses";
import { latestCompletedSubmissionsByTest } from "@/lib/examPresentation";
import {
  studentApi,
  type Enrollment,
  type ExamSubmission,
  type Lesson,
  type MyProgress,
  type Paginated,
  type PracticeTest,
  type Question,
} from "@/lib/studentApi";
import { loadMe, login, logout, register } from "./authSlice";

export type StudentResourceKind = "levels" | "lessons" | "questions" | "tests";
export type StudentResource = Level | Lesson | Question | PracticeTest;
type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type PageEntry<T> = {
  data: Paginated<T> | null;
  status: RequestStatus;
  error: string | null;
  lastFetched: number | null;
};

type OverviewState = {
  progress: MyProgress;
  enrollmentCount: number;
  status: RequestStatus;
  error: string | null;
  lastFetched: number | null;
};

export type ExamSubmissionsState = {
  items: ExamSubmission[];
  status: RequestStatus;
  error: string | null;
  errorKind: ApiErrorKind | null;
  lastFetched: number | null;
};

export type PracticeTestDetailEntry = {
  data: PracticeTest | null;
  status: RequestStatus;
  error: string | null;
  errorKind: ApiErrorKind | null;
  lastFetched: number | null;
};

export type StudentState = {
  overview: OverviewState;
  enrollmentPages: Record<number, PageEntry<Enrollment>>;
  enrolledCoursePages: Record<number, PageEntry<Course>>;
  resources: Record<StudentResourceKind, Record<number, PageEntry<StudentResource>>>;
  examSubmissions: ExamSubmissionsState;
  testDetails: Record<number, PracticeTestDetailEntry>;
};

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
};

type StudentThunkConfig = {
  state: {
    student: StudentState;
    courses?: { pages: Record<number, { data: Paginated<Course> | null }> };
  };
  rejectValue: string;
};

type PageRequest = { page: number; force?: boolean };

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
      return api.rejectWithValue(
        getApiErrorMessage(error, "دریافت اطلاعات داشبورد ناموفق بود."),
      );
    }
  },
  {
    condition: (request, { getState }) => {
      const overview = getState().student.overview;
      if (overview.status === "loading") return false;
      return Boolean(request?.force) || !isCacheFresh(overview.lastFetched);
    },
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
      return api.rejectWithValue(
        getApiErrorMessage(error, "دریافت اطلاعات از سرور ناموفق بود."),
      );
    }
  },
  {
    condition: ({ kind, page, force }, { getState }) => {
      const entry = getState().student.resources[kind][page];
      if (entry?.status === "loading") return false;
      return Boolean(force) || !isCacheFresh(entry?.lastFetched);
    },
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
      const fetchedCourses = await Promise.all(
        missingIds.map((courseId) => studentApi.course(courseId)),
      );
      fetchedCourses.forEach((course) => knownCourses.set(course.id, course));
      const courses = enrollments.results
        .map((enrollment) => knownCourses.get(enrollment.course))
        .filter((course): course is Course => Boolean(course));
      return {
        page,
        enrollments,
        courses: { ...enrollments, results: courses },
      };
    } catch (error) {
      return api.rejectWithValue(
        getApiErrorMessage(error, "دریافت دوره‌های ثبت‌نام‌شده ناموفق بود."),
      );
    }
  },
  {
    condition: ({ page, force }, { getState }) => {
      const entry = getState().student.enrolledCoursePages[page];
      if (entry?.status === "loading") return false;
      return Boolean(force) || !isCacheFresh(entry?.lastFetched);
    },
  },
);

type StudentDetailThunkConfig = {
  state: { student: StudentState };
  rejectValue: ApiErrorInfo;
};

const EXAM_SUBMISSIONS_ERROR = "دریافت نتایج آزمون‌ها ناموفق بود.";
const TEST_DETAIL_ERROR = "دریافت اطلاعات آزمون ناموفق بود.";

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
    condition: (request, { getState }) => {
      const entry = getState().student.examSubmissions;
      if (entry.status === "loading") return false;
      return Boolean(request?.force) || !isCacheFresh(entry.lastFetched);
    },
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
    condition: ({ id, force }, { getState }) => {
      const entry = getState().student.testDetails[id];
      if (entry?.status === "loading") return false;
      return Boolean(force) || !isCacheFresh(entry?.lastFetched);
    },
  },
);

function pendingPage<T>(entry: PageEntry<T> | undefined): PageEntry<T> {
  return {
    data: entry?.data ?? null,
    status: "loading",
    error: null,
    lastFetched: entry?.lastFetched ?? null,
  };
}

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    invalidateStudentProgress(state) {
      state.overview.lastFetched = null;
    },
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
        state.enrollmentPages[1] = {
          data: action.payload.enrollments,
          status: "succeeded",
          error: null,
          lastFetched: fetchedAt,
        };
      })
      .addCase(fetchStudentOverview.rejected, (state, action) => {
        state.overview.status = "failed";
        state.overview.error = String(action.payload ?? "دریافت اطلاعات داشبورد ناموفق بود.");
      })
      .addCase(fetchStudentResource.pending, (state, action) => {
        const { kind, page } = action.meta.arg;
        state.resources[kind][page] = pendingPage(state.resources[kind][page]);
      })
      .addCase(fetchStudentResource.fulfilled, (state, action) => {
        const { kind, page, data } = action.payload;
        state.resources[kind][page] = {
          data,
          status: "succeeded",
          error: null,
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchStudentResource.rejected, (state, action) => {
        const { kind, page } = action.meta.arg;
        const entry = state.resources[kind][page];
        state.resources[kind][page] = {
          data: entry?.data ?? null,
          status: "failed",
          error: String(action.payload ?? "دریافت اطلاعات از سرور ناموفق بود."),
          lastFetched: entry?.lastFetched ?? null,
        };
      })
      .addCase(fetchEnrolledCourses.pending, (state, action) => {
        const { page } = action.meta.arg;
        state.enrolledCoursePages[page] = pendingPage(state.enrolledCoursePages[page]);
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        const { page, enrollments, courses } = action.payload;
        const fetchedAt = Date.now();
        state.enrollmentPages[page] = {
          data: enrollments,
          status: "succeeded",
          error: null,
          lastFetched: fetchedAt,
        };
        state.enrolledCoursePages[page] = {
          data: courses,
          status: "succeeded",
          error: null,
          lastFetched: fetchedAt,
        };
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        const { page } = action.meta.arg;
        const entry = state.enrolledCoursePages[page];
        state.enrolledCoursePages[page] = {
          data: entry?.data ?? null,
          status: "failed",
          error: String(action.payload ?? "دریافت دوره‌های ثبت‌نام‌شده ناموفق بود."),
          lastFetched: entry?.lastFetched ?? null,
        };
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
        state.examSubmissions.error =
          action.payload?.message ?? EXAM_SUBMISSIONS_ERROR;
        state.examSubmissions.errorKind = action.payload?.kind ?? "unknown";
      })
      .addCase(fetchPracticeTestDetail.pending, (state, action) => {
        const { id } = action.meta.arg;
        const entry = state.testDetails[id];
        state.testDetails[id] = {
          data: entry?.data ?? null,
          status: "loading",
          error: null,
          errorKind: null,
          lastFetched: entry?.lastFetched ?? null,
        };
      })
      .addCase(fetchPracticeTestDetail.fulfilled, (state, action) => {
        state.testDetails[action.meta.arg.id] = {
          data: action.payload,
          status: "succeeded",
          error: null,
          errorKind: null,
          lastFetched: Date.now(),
        };
      })
      .addCase(fetchPracticeTestDetail.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const entry = state.testDetails[id];
        state.testDetails[id] = {
          data: entry?.data ?? null,
          status: "failed",
          error: action.payload?.message ?? TEST_DETAIL_ERROR,
          errorKind: action.payload?.kind ?? "unknown",
          lastFetched: entry?.lastFetched ?? null,
        };
      })
      .addCase(logout, () => initialState)
      .addCase(loadMe.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState);
  },
});

export const { invalidateExamSubmissions, invalidateStudentProgress } =
  studentSlice.actions;

/** Latest finished attempt per practice test, keyed by the test id. */
export const selectLatestExamSubmissions = createSelector(
  [(state: { student: StudentState }) => state.student.examSubmissions.items],
  latestCompletedSubmissionsByTest,
);
export default studentSlice.reducer;
