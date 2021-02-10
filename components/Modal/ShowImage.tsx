import React, { useEffect, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import styled from 'styled-components';

interface Props {
  src: string;
}

const ImageContainer = styled.div<{ zoom: boolean }>`
  margin: 0 auto;

  div.react-transform-component,
  div.react-transform-element {
    height: 100%;
    cursor: ${(props) => (props.zoom ? 'grab' : '')};

    :active {
      cursor: ${(props) => (props.zoom ? 'grabbing' : '')};
    }
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: calc(100vh - 54px);
`;

const ShowImage: React.FC<Props> = ({ src }) => {
  const [zoom, setZoom] = useState(false);
  const imageContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(false);
  }, [src]);

  const handleZoom = (e: any) => {
    if (e.scale > 1 && !zoom) {
      setTimeout(() => {
        setZoom(true);
      }, 200);
    } else if (e.scale === 1 && zoom) {
      setZoom(false);
    }
  };

  return (
    <ImageContainer ref={imageContainer} zoom={zoom}>
      <TransformWrapper
        key={src}
        doubleClick={{ mode: zoom ? 'reset' : 'zoomIn', step: 30 }}
        pan={{ disabled: !zoom }}
        wheel={{ disabled: true }}
        onZoomChange={handleZoom}
      >
        <TransformComponent>
          <StyledImage src={src} key={src} />
        </TransformComponent>
      </TransformWrapper>
    </ImageContainer>
  );
};

export default ShowImage;
