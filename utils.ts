import { Media, SidecarEdges } from './interfaces/index';

// Filter out videos, map item, flatten nested array, map to add index
export const bakeImageList = (arr: Media[], mediaCount = 0) => {
  const display = arr
    .filter((item) => !item.node.is_video)
    .map((postItem) => {
      const sideCar = postItem.node.edge_sidecar_to_children;
      if (sideCar) {
        const sideCarMedia = sideCar.edges.map((sideCarItem) => {
          return {
            src:
              sideCarItem.node.display_resources[
                sideCarItem.node.display_resources.length - 1
              ].src,
            preview: sideCarItem.node.display_resources[0].src,
            id: sideCarItem.node.id,
            shortcode: postItem.node.shortcode,
            selected: false,
          };
        });
        return sideCarMedia;
      }
      return {
        src:
          postItem.node.display_resources[
            postItem.node.display_resources.length - 1
          ].src,
        preview: postItem.node.display_resources[0].src,
        id: postItem.node.id,
        shortcode: postItem.node.shortcode,
        selected: false,
      };
    })
    .flat()
    .map((item, index) => ({
      ...item,
      index: index + mediaCount,
    }));
  return display;
};

export const bakeVideoList = (arr: Media[], mediaCount = 0) => {
  const display = arr
    .filter((item) => item.node.is_video)
    .map((item, index) => {
      return {
        id: item.node.id,
        shortcode: item.node.shortcode,
        src: item.node.video_url,
        preview: item.node.display_resources[0].src,
        selected: false,
        index: index + mediaCount,
      };
    });
  return display;
};

export const bakeFromSideCar = (arr: SidecarEdges[]) => {
  return arr.map((item, index) => {
    return {
      src:
        item.node.display_resources[item.node.display_resources.length - 1].src,
      index,
      id: item.node.id,
    };
  });
};

export const baseUrl = 'https://www.instagram.com';

export const mediaUrl = (pk: string, endcursor = '') => {
  return `${baseUrl}/graphql/query?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables={"id":${JSON.stringify(
    pk
  )},"first":50,"after":${JSON.stringify(endcursor)}}`;
};
