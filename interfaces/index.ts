export interface User {
  pk: string;
  full_name: string;
  username: string;
  profile_pic_url: string;
  is_private: boolean;
}

export interface Users {
  user: User;
}

export interface UserResponse {
  users: Users[];
}

export interface Multimedia {
  id: string;
  shortcode: string;
  src: string;
  preview: string;
  selected: boolean;
  index: number;
}

export interface ResponseImage {
  id: string;
  src: string;
  selected: boolean;
  index: number;
}

interface SidecarItem {
  node: {
    display_resources: ResponseImage[];
    is_video: boolean;
    id: string;
  };
}

export interface Media {
  node: {
    display_resources: ResponseImage[];
    is_video: boolean;
    id: string;
    video_url: string;
    shortcode: string;
    edge_sidecar_to_children: {
      edges: SidecarItem[];
    };
  };
}

export interface PageInfo {
  end_cursor: string;
  has_next_page: boolean;
}

export interface MediaResponse {
  data: {
    user: {
      edge_owner_to_timeline_media: {
        edges: Media[];
        page_info: PageInfo;
      };
    };
  };
}

export interface Owner {
  id: string;
  profile_pic_url: string;
  username: string;
  full_name: string;
  is_private: boolean;
}

export interface Dimensions {
  width: string;
  height: string;
}

export interface SidecarEdges {
  node: {
    id: string;
    shortcode: string;
    dimensions: Dimensions;
    display_resources: {
      src: string;
    }[];
    is_video: boolean;
    video_url?: string;
  };
}

export interface SingleMediaResponse {
  data: {
    shortcode_media: {
      id: string;
      shortcode: string;
      is_video: boolean;
      video_url?: string;
      display_resources: {
        src: string;
      }[];
      owner: Owner;
      dimensions: Dimensions;
      edge_sidecar_to_children?: {
        edges: SidecarEdges[];
      };
    };
  };
}

//Blog
import { Document } from '@contentful/rich-text-types';

export interface ArticleFields {
  title: string;
  slug: string;
  metaDescription: string;
  date: string;
  preview: string;
  content: Document;
}

export interface FullArticle {
  fields: ArticleFields;
  sys: {
    id: string;
    locale: string;
  };
}
