/**
 * Minimal Yoast SEO head JSON structure.
 * Keys are optional because Yoast output can vary per site/plugin version.
 */
export interface WPYoastHeadJson {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: {
    index?: string;
    follow?: string;
    "max-snippet"?: string;
    "max-image-preview"?: string;
    "max-video-preview"?: string;
  };
  og_locale?: string;
  og_type?:
    | "article"
    | "website"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  article_published_time?: string;
  article_modified_time?: string;
  og_image?: Array<{
    url?: string;
    width?: number;
    height?: number;
    type?: string;
    alt?: string;
    [key: string]: unknown;
  }>;
  twitter_card?: "summary" | "summary_large_image" | "player" | "app";
  twitter_title?: string;
  twitter_description?: string;
  twitter_misc?: Record<string, string>;
  schema?: WPYoastSchema;
  [key: string]: unknown;
}

export interface WPYoastSchema {
  "@context"?: string;
  "@graph"?: WPYoastSchemaNode[];
}

export interface WPYoastSchemaNode {
  "@type"?: string | string[];
  "@id"?: string;
  url?: string;
  name?: string;
  description?: string;
  inLanguage?: string;
  isPartOf?: { "@id"?: string };
  primaryImageOfPage?: { "@id"?: string };
  image?:
    | { "@id"?: string }
    | { url?: string; width?: number; height?: number; "@type"?: string }
    | Array<{
        url?: string;
        width?: number;
        height?: number;
        "@type"?: string;
      }>;
  thumbnailUrl?: string;
  breadcrumb?: { "@id"?: string };
  itemListElement?: unknown;
  position?: number;
  potentialAction?: unknown;
  sameAs?: string[];
  [key: string]: unknown;
}

/**
 * Response returned by Yoast get_head endpoint.
 */
export interface WPYoastHeadResponse {
  head?: string;
  json?: WPYoastHeadJson;
}
