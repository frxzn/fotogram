import React, { useEffect } from 'react';
import styled from 'styled-components';

interface Props {
  src: string;
}

const overflowModal = '5rem';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  background-color: rgba(0, 0, 0, 0.9);

  @media (max-width: 735px) {
    /* height: calc(100% + ${overflowModal});
    padding-bottom: ${overflowModal}; */
  }
`;

const ImageContainer = styled.div`
  margin: 0 auto;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Icon = styled.img`
  height: 2rem;
  width: 2rem;
  margin: auto 0;

  :hover {
    cursor: pointer;
  }

  @media (max-width: 735px) {
    display: none;
  }
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
      <Icon src="/icons/prev.svg" alt="prev icon" />
      <ImageContainer>
        <StyledImage src={src} />
      </ImageContainer>
      <Icon src="/icons/next.svg" alt="next icon" />
    </Container>
  );
};

export default PictureModal;
