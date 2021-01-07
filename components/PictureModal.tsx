import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
// import axios from 'axios';

interface Props {
  src: string;
  mediaCount: number;
  reset: boolean;
  setReset: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
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
    cursor: grab;

    :active {
      cursor: grabbing;
    }
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
  position: absolute;
  top: 50%;
  bottom: 50%;
  height: 20rem;
  width: 2rem;
  margin: auto 0;
  z-index: 100;

  :hover {
    cursor: pointer;
  }
`;

const Icon = styled.img`
  height: 2rem;
  width: 2rem;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;

  img {
    height: 1.5rem;
    width: 1.5rem;
  }
`;

const amplitude = 0.5;
const intercept = 0.9;

const PictureModal: React.FC<Props> = ({
  src,
  mediaCount,
  reset,
  setReset,
  setShow,
  setSelected,
}) => {
  const [zoom, setZoom] = useState(false);
  const [transparency, setTransparency] = useState(intercept);
  const [resetingPan, setResetingPan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const init = async () => {
  //     const res = await axios.post('https://insta-stories.ru/api/stories', {
  //       xtrip: 'afsdfi3k4fdsd5gg',
  //       id: '2017771114',
  //       username: 'vismaramartina',
  //     });
  //     console.log(res);
  //   };
  //   init();
  // }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!reset) {
      setReset(true);
    }
  }, [src]);

  useEffect(() => {
    console.log('width', ref.current ? ref.current.offsetWidth : 0);
  }, [ref.current]);

  const handleArrowChange = (side: string) => {
    switch (side) {
      case 'right':
        setSelected((prev) => (prev + 1 < mediaCount ? prev + 1 : prev));
        setReset(false);
        break;
      case 'left':
        setSelected((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        setReset(false);
        break;
      default:
        break;
    }
  };

  const handleDragClose = (e: any) => {
    if (ref.current && e.scale === 1) {
      if (Math.abs(e.positionY / ref.current.offsetHeight) >= 0.3) {
        setShow(false);
      } else {
        setResetingPan(true);
        setTransparency(intercept);
        setTimeout(() => {
          setResetingPan(false);
        }, 400);
      }
    }
  };

  const handleZoom = (e: any) => {
    if (e.scale > 1 && !zoom) {
      setTimeout(() => {
        setZoom(true);
      }, 200);
    } else if (e.scale === 1 && zoom) {
      setZoom(false);
    }
  };

  const handleTransparency = (e: any) => {
    if (ref.current && e.scale === 1) {
      const val =
        Math.abs(e.positionY / ref.current.offsetHeight) * -amplitude +
        intercept;
      setTransparency(val);
    }
  };

  return (
    <Container
      style={{
        backgroundColor: `rgba(0,0,0,${transparency})`,
        transition: resetingPan ? '400ms ease-out' : '',
      }}
    >
      <CloseIcon onClick={() => setShow(false)}>
        <Icon src="/icons/cancel.svg" alt="close icon" />
      </CloseIcon>
      <IconContainer
        onClick={() => handleArrowChange('left')}
        style={{ left: 0 }}
      >
        <Icon src="/icons/prev.svg" alt="prev icon" />
      </IconContainer>
      <ImageContainer ref={ref}>
        <TransformWrapper
          scale={reset ? undefined : 1}
          positionX={reset ? undefined : 0}
          positionY={reset ? undefined : 0}
          doubleClick={{ mode: zoom ? 'reset' : 'zoomIn', step: 50 }}
          pan={{ lockAxisX: !zoom }}
          onPanningStop={handleDragClose}
          onPanning={handleTransparency}
          onZoomChange={handleZoom}
        >
          <TransformComponent>
            <StyledImage src={src} />
          </TransformComponent>
        </TransformWrapper>
      </ImageContainer>
      <IconContainer
        onClick={() => handleArrowChange('right')}
        style={{ right: 0 }}
      >
        <Icon src="/icons/next.svg" alt="next icon" />
      </IconContainer>
    </Container>
  );
};

export default PictureModal;
