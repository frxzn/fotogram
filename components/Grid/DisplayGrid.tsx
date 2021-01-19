import React from 'react';
import styled from 'styled-components';
import { User, Image, Video } from '../../interfaces';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';
import TabNavigation from '../TabNavigation';

interface Props {
  user: User | undefined;
  imageList: Image[];
  videoList: Video[];
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  handleSelect: (index: number) => void;
}

const Container = styled.div``;

const DisplayGrid: React.FC<Props> = (props) => {
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

  return (
    <Container>
      <TabNavigation
        selectedTab={props.selectedTab}
        setSelectedTab={props.setSelectedTab}
      />
      {render}
    </Container>
  );
};

export default DisplayGrid;
