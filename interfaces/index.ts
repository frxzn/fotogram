// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

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

interface Src {
  low: string;
  high: string;
}

export interface Image {
  id: string;
  src: Src;
  selected: boolean;
  index: number;
}

export interface ResponseImage {
  id: string;
  src: string;
  selected: boolean;
  index: number;
}

export interface Video {
  id: string;
  videoUrl: string;
  preview: string;
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

export interface Story {
  id: string;
  image: string;
  is_video: boolean;
  timestamp: number;
  video: string;
}

export interface FormattedStory {
  url: string;
  type: string;
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
