// YouTube link helpers for the Médiathèque (videos are hosted on YouTube
// and only their URL is stored in media_items.video_url).

const YOUTUBE_ID =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i;

/** "https://youtu.be/abc…" / ".../watch?v=abc…" / ".../shorts/abc…" → "abc…" */
export const getYouTubeId = (url: string): string | null => url.match(YOUTUBE_ID)?.[1] ?? null;

/** Shorts are vertical (9:16); everything else is shown as 16:9. */
export const isYouTubeShort = (url: string): boolean => /youtube\.com\/shorts\//i.test(url);

export const getYouTubeEmbedUrl = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

export const getYouTubeThumbnail = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
