import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-spinner-material';
import { User, Image, Video, PageInfo, MediaResponse } from '../../interfaces';
import { bakeImageList, bakeVideoList, mediaUrl } from '../../utils';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';
import TabNavigation from '../TabNavigation';
import DownloadControls from '../DownloadControls';

interface Props {
  user: User | undefined;
  imageList: Image[];
  videoList: Video[];
  pageInfo: PageInfo | undefined;
  selectedTab: string;
  handleSelect: (index: number) => void;
  setImageList: React.Dispatch<React.SetStateAction<Image[]>>;
  setVideoList: React.Dispatch<React.SetStateAction<Video[]>>;
  setPageInfo: React.Dispatch<React.SetStateAction<PageInfo | undefined>>;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4rem;

  @media (max-width: 735px) {
    padding: 2rem 0;
  }
`;

const Button = styled.button`
  font-size: 1.2rem;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 4px;
  padding: 1rem 2rem;
  text-align: center;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};
  :hover {
    cursor: pointer;
    color: #000;
  }
`;

const DisplayGrid: React.FC<Props> = (props) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (props.user && props.pageInfo) {
      if (props.pageInfo.has_next_page) {
        setLoadingMore(true);
        try {
          const mediaRes = await axios.get<MediaResponse>(
            mediaUrl(props.user.pk, props.pageInfo.end_cursor)
          );
          const images = bakeImageList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            props.imageList.length
          );
          const videos = bakeVideoList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            props.videoList.length
          );
          props.setPageInfo(
            mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
          );
          props.setImageList((prev) => [...prev, ...images]);
          props.setVideoList((prev) => [...prev, ...videos]);
        } catch (err) {
          console.log(err);
        }
        setLoadingMore(false);
      }
    }
  };

  let render;
  if (props.selectedTab === 'images') {
    render = (
      <ImageGrid
        user={props.user}
        imageList={props.imageList}
        handleSelect={props.handleSelect}
      />
    );
  } else if (props.selectedTab === 'videos') {
    render = (
      <VideoGrid
        user={props.user}
        videoList={props.videoList}
        handleSelect={props.handleSelect}
      />
    );
  }

  let renderButton;
  if (loadingMore) {
    renderButton = (
      <Spinner radius={64} color={'#ff0078'} stroke={6} visible={true} />
    );
  } else {
    renderButton = <Button onClick={handleLoadMore}>Load more</Button>;
  }

  return (
    <>
      <TabNavigation
        selectedTab={props.selectedTab}
        setSelectedTab={props.setSelectedTab}
      />
      {render}
      {props.pageInfo?.has_next_page && (
        <ButtonContainer>{renderButton}</ButtonContainer>
      )}
      <DownloadControls downloadMode={false} />
    </>
  );
};

export default DisplayGrid;
