import React, { useEffect } from 'react';
import styled from 'styled-components';

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
  margin: 0 auto;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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
      <div style={{ margin: 'auto 0' }}></div>
      <ImageContainer>
        <StyledImage src={src} />
      </ImageContainer>
      <div></div>
    </Container>
  );
};

export default PictureModal;
