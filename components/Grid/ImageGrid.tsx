import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import {
  LazyLoadImage,
  trackWindowScroll,
  LazyComponentProps,
} from 'react-lazy-load-image-component';
import { Multimedia } from '../../interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
  handleClick: (item: Multimedia) => void;
}

interface ImageProps {
  selected: boolean;
  downloadmode: number;
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

const GridItem = styled.a<ImageProps>`
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
  scrollPosition,
  handleClick,
}) => {
  const downloadMode = useSelector(
    (state: RootState) => state.userInterface.downloadMode
  );
  const user = useSelector((state: RootState) => state.api.user);
  const images = useSelector((state: RootState) => state.api.images);

  return (
    <GridContainer>
      {images.map((image) => (
        <Link
          href={`/${user?.username}?shortcode=${image.shortcode}`}
          as={`/${user?.username}/${image.shortcode}`}
          key={image.id}
          scroll={false}
        >
          <GridItem
            onClick={() => handleClick(image)}
            downloadmode={downloadMode ? 1 : 0}
            selected={image.selected}
          >
            <StyledImage
              src={image.preview}
              placeholder={<Placeholder />}
              alt={`Foto de ${user?.full_name}`}
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
        </Link>
      ))}
    </GridContainer>
  );
};

export default trackWindowScroll(ImageGrid);
