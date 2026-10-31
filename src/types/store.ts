import type { ApiErrorInfo, ApiErrorKind, ApiFieldErrors, Paginated } from "@/types/api";
import type { AuthFeatures, PatchedUserRequest, User, UserRequest } from "@/types/auth";
import type { Course, Lesson } from "@/types/course";
import type { ExamSubmission, PracticeTest } from "@/types/exam";
import type { Homework, HomeworkScope, HomeworkSubmission } from "@/types/homework";
import type { Skill } from "@/types/skill";
import type {
  CourseProgress,
  Enrollment,
  MyProgress,
  StudentResource,
  StudentResourceKind,
} from "@/types/student";

// Shared shapes

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

/** One item cached by id, with the kind of error when its request failed. */
export type DetailEntry<T> = {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  errorKind: ApiErrorKind | null;
  lastFetched: number | null;
};

/** One page of a list, cached by page number. */
export type PageEntry<T> = {
  data: Paginated<T> | null;
  status: RequestStatus;
  error: string | null;
  lastFetched: number | null;
};

export type PageRequest = { page: number; force?: boolean };

// Auth

export type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
  profileUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  profileUpdateError: string | null;
  /** Account features from `/api/auth/features/`; `null` until loaded. */
  features: AuthFeatures | null;
  featuresStatus: "idle" | "loading" | "succeeded" | "failed";
  featuresLastFetched: number | null;
};

/** PATCH sends only changed fields; PUT replaces all editable fields at once. */
export type ProfileUpdate =
  | { method: "patch"; data: PatchedUserRequest }
  | { method: "put"; data: UserRequest };

/** Field errors are keyed by API field name, e.g. `current_password`. */
export type ProfileUpdateError = { message: string; fieldErrors: ApiFieldErrors };

// Courses

export type CoursesState = {
  pages: Record<number, PageEntry<Course>>;
  /** By course id. `has_access` depends on the signed-in user. */
  details: Record<number, DetailEntry<Course>>;
  /** Lesson pages by course id, then page number. */
  lessons: Record<number, Record<number, PageEntry<Lesson>>>;
};

export type FetchCoursesRequest = { page?: number; force?: boolean } | number | undefined;

export type CoursesThunkConfig = {
  state: { courses: CoursesState };
  rejectValue: ApiErrorInfo;
};

// Homework

export type HomeworkListFilters = {
  page: number;
  course?: number;
  scope?: HomeworkScope;
};

export type HomeworkState = {
  /** Server-filtered pages, keyed by `homeworkListKey`. */
  lists: Record<string, DetailEntry<Paginated<Homework>>>;
  details: Record<number, DetailEntry<Homework>>;
  /** Full submission records, keyed by submission id. */
  submissions: Record<number, DetailEntry<HomeworkSubmission>>;
};

export type HomeworkThunkConfig = {
  state: { homework: HomeworkState };
  rejectValue: ApiErrorInfo;
};

// Skills

export type SkillsState = {
  items: Skill[];
  selected: Skill | null;
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  detailRequestedId: number | null;
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
  successMessage: string | null;
  listLastFetched: number | null;
  detailLastFetched: number | null;
};

export type SkillsThunkConfig = {
  state: { skills: SkillsState };
  rejectValue: string;
};

// Student

export type OverviewState = {
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

export type StudentState = {
  overview: OverviewState;
  enrollmentPages: Record<number, PageEntry<Enrollment>>;
  enrolledCoursePages: Record<number, PageEntry<Course>>;
  resources: Record<StudentResourceKind, Record<number, PageEntry<StudentResource>>>;
  examSubmissions: ExamSubmissionsState;
  testDetails: Record<number, DetailEntry<PracticeTest>>;
  /** The signed-in student's progress, by course id. */
  courseProgress: Record<number, DetailEntry<CourseProgress>>;
};

export type StudentThunkConfig = {
  state: {
    student: StudentState;
    courses?: { pages: Record<number, { data: Paginated<Course> | null }> };
  };
  rejectValue: string;
};

export type StudentDetailThunkConfig = {
  state: { student: StudentState };
  rejectValue: ApiErrorInfo;
};
