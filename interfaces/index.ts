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

export interface Display {
  id: string;
  src: string;
  index: number;
}

interface SidecarItem {
  node: {
    display_resources: Display[];
    is_video: boolean;
    id: string;
  };
}

export interface Media {
  node: {
    display_resources: Display[];
    is_video: boolean;
    id: string;
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
