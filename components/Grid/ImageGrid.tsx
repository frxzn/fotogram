import React from 'react';
import styled from 'styled-components';
import {
  LazyLoadImage,
  trackWindowScroll,
  LazyComponentProps,
} from 'react-lazy-load-image-component';
import { User, Image } from '../../interfaces';

interface Props {
  downloadMode: boolean;
  user: User | undefined;
  imageList: Image[];
  setImageList: React.Dispatch<React.SetStateAction<Image[]>>;
  handleSelect: (index: number) => void;
}

interface ImageProps {
  selected: boolean;
  downloadmode: number;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 28px;

  @media (max-width: 735px) {
    grid-gap: 3px;
  }
`;

const GridItem = styled.div<ImageProps>`
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
    filter: ${(props) =>
      !props.downloadmode ? 'brightness(calc(2 / 3))' : ''};
  }

  .circle {
    background-color: ${(props) =>
      props.downloadmode && !props.selected
        ? 'transparent'
        : props.theme.colors.primary} !important;
    opacity: 1 !important;
  }

  /* :hover .circle {
    background-color: ${(props) =>
    props.downloadmode && !props.selected ? props.theme.colors.primary : ''};
    opacity: 0.5;
  }

  @media (max-width: 735px) {
    .circle {
      background-color: ${(props) =>
    props.downloadmode && !props.selected
      ? 'transparent'
      : props.theme.colors.primary} !important;
      opacity: 1 !important;
    }
  } */
`;

const StyledImage = styled(LazyLoadImage)<ImageProps>`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
`;

const Circle = styled.div<ImageProps>`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  border: 2px solid #fff;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  background-color: ${(props) =>
    props.selected ? props.theme.colors.primary : ''};
`;

const Placeholder = styled.div`
  background-color: #e4e4e4;
  width: 100%;
  height: 100%;
`;

const ImageGrid: React.FC<Props & LazyComponentProps> = ({
  user,
  imageList,
  setImageList,
  handleSelect,
  scrollPosition,
  downloadMode,
}) => {
  const handleClick = (image: Image) => {
    if (!downloadMode) {
      handleSelect(image.index);
    } else {
      setImageList((prevImageList) => {
        const imageIndex = prevImageList.findIndex(
          (currImage) => currImage.id === image.id
        );
        let newImageList = [...prevImageList];
        newImageList[imageIndex] = {
          ...newImageList[imageIndex],
          selected: !newImageList[imageIndex].selected,
        };
        return newImageList;
      });
    }
  };

  return (
    <GridContainer>
      {imageList.map((image) => (
        <GridItem
          key={image.id}
          onClick={() => handleClick(image)}
          downloadmode={downloadMode ? 1 : 0}
          selected={image.selected}
        >
          <StyledImage
            src={image.src.low}
            placeholder={<Placeholder />}
            alt={`${user?.full_name}'s photo`}
            scrollPosition={scrollPosition}
            selected={image.selected}
            downloadmode={downloadMode ? 1 : 0}
          />
          {downloadMode && (
            <Circle
              key={image.index}
              className="circle"
              selected={image.selected}
              downloadmode={downloadMode ? 1 : 0}
            />
          )}
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default trackWindowScroll(ImageGrid);
