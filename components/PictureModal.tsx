import React, { useEffect } from 'react';
import styled from 'styled-components';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface Props {
  src: string;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  background-color: rgba(0, 0, 0, 0.9);
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 auto;

  div.react-transform-component,
  div.react-transform-element {
    height: 100%;
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  height: 10rem;
  margin: auto 0;

  :hover {
    cursor: pointer;
  }

  @media (max-width: 735px) {
    display: none;
  }
`;

const Icon = styled.img`
  height: 2rem;
  width: 2rem;
`;

const PictureModal: React.FC<Props> = ({ src }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <Container>
      <IconContainer>
        <Icon src="/icons/prev.svg" alt="prev icon" />
      </IconContainer>
      <ImageContainer>
        <TransformWrapper scale={1} positionX={0} positionY={0}>
          <TransformComponent>
            <StyledImage src={src} />
          </TransformComponent>
        </TransformWrapper>
      </ImageContainer>
      <IconContainer>
        <Icon src="/icons/next.svg" alt="next icon" />
      </IconContainer>
    </Container>
  );
};

export default PictureModal;
