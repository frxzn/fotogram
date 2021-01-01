import { Media } from './interfaces/index';

// Filter out videos, map item, flatten nested array, map to add index
export const bakeDisplayList = (arr: Media[], mediaCount = 0) => {
  const display = arr
    .filter((item) => !item.node.is_video)
    .map((item) => {
      const sideCar = item.node.edge_sidecar_to_children;
      if (sideCar) {
        const sideCarMedia = sideCar.edges.map((item) => {
          return {
            src:
              item.node.display_resources[
                item.node.display_resources.length - 1
              ].src,
            id: item.node.id,
            selected: false,
          };
        });
        return sideCarMedia;
      }
      return {
        src:
          item.node.display_resources[item.node.display_resources.length - 1]
            .src,
        id: item.node.id,
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

export const mediaUrl = (pk: string, endcursor = '') => {
  return `https://www.instagram.com/graphql/query?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables={"id":${JSON.stringify(
    pk
  )},"first":50,"after":${JSON.stringify(endcursor)}}`;
};
