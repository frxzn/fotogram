import React from 'react';
import styled from 'styled-components';
import { User, Video } from '../../interfaces';

interface Props {
  user: User | undefined;
  videoList: Video[];
  handleSelect: (index: number) => void;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 28px;
  margin-bottom: 3rem;

  @media (max-width: 735px) {
    grid-gap: 3px;
    margin-bottom: 3px;
  }
`;

const GridItem = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  ::after {
    content: '';
    padding-bottom: 100%;
    display: block;
  }

  :hover {
    cursor: pointer;
    filter: brightness(calc(2 / 3));
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;

  :hover {
    cursor: pointer;
  }
`;

const VideoGrid: React.FC<Props> = ({ user, videoList, handleSelect }) => {
  return (
    <GridContainer>
      {videoList.map((video) => (
        <GridItem key={video.id} onClick={() => handleSelect(video.index)}>
          <StyledImage src={video.preview} alt={`${user?.full_name}'s video`} />
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default VideoGrid;
