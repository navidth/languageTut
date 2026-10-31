import type { MediaAsset } from "@/types/media";
import type { Level } from "@/types/level";
import type { Skill } from "@/types/skill";
import type { Paginated } from "@/types/api";

export type CourseType = "general" | "ielts" | (string & {});

export type CourseMedia = MediaAsset;

export type Course = {
  id: number;
  title: string;
  level: number;
  level_detail: Level;
  course_type: CourseType;
  description: string;
  price: number;
  is_free: boolean;
  has_access: boolean;
  media: CourseMedia[] | null;
  is_recommended: boolean;
  recommendation_order: number | null;
  is_active: boolean;
  deleted_at: string | null;
  lessons_count: number;
  resources_count: number;
  created_at: string;
  updated_at: string;
};

export type PaginatedCourses = Paginated<Course>;

export type Lesson = {
  id: number;
  course: number;
  skill: number;
  skill_detail: Skill;
  title: string;
  content: string;
  audio_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  order: number;
  is_published: boolean;
  /** Sent by the course lessons endpoint, not by the student lessons list. */
  created_at?: string;
  updated_at?: string;
};

export type PaginatedLessons = Paginated<Lesson>;
