import React from 'react';
import styled from 'styled-components';
import {
  LazyLoadImage,
  trackWindowScroll,
  LazyComponentProps,
} from 'react-lazy-load-image-component';
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
  padding-bottom: 2rem;

  @media (max-width: 735px) {
    grid-gap: 3px;
    padding-bottom: 0;
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

const StyledImage = styled(LazyLoadImage)`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;

  :hover {
    cursor: pointer;
  }
`;

const Placeholder = styled.div`
  background-color: #e4e4e4;
  width: 100%;
  height: 100%;
`;

const VideoGrid: React.FC<Props & LazyComponentProps> = ({
  user,
  videoList,
  handleSelect,
  scrollPosition,
}) => {
  return (
    <GridContainer>
      {videoList.map((video) => (
        <GridItem key={video.id} onClick={() => handleSelect(video.index)}>
          <StyledImage
            src={video.preview}
            placeholder={<Placeholder />}
            alt={`Video de ${user?.full_name}`}
            scrollPosition={scrollPosition}
          />
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default trackWindowScroll(VideoGrid);
