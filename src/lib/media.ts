export type MediaAssetObject = {
  id?: number | string;
  media_type?: string | null;
  type?: string | null;
  kind?: string | null;
  media_kind?: string | null;
  mime_type?: string | null;
  content_type?: string | null;
  file?: string | null;
  media_file?: string | null;
  file_url?: string | null;
  media_url?: string | null;
  url?: string | null;
  src?: string | null;
  audio?: string | null;
  audio_url?: string | null;
  video?: string | null;
  video_url?: string | null;
  poster?: string | null;
  poster_url?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  title?: string | null;
  caption?: string | null;
  name?: string | null;
  description?: string | null;
  order?: number | null;
  duration?: number | string | null;
  duration_seconds?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type MediaAsset = string | MediaAssetObject;

export type PlayableMediaKind = "audio" | "video";

export type PlayableMedia = {
  id: string;
  kind: PlayableMediaKind;
  url: string;
  title: string;
  description?: string;
  mimeType?: string;
  poster?: string;
};
