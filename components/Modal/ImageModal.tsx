import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAppDispatch } from '../../store';
import {
  setShowMedia,
  setSelectedMediaIndex,
} from '../../slices/UserInterfaceSlice';
interface Props {
  src: string;
  id: string;
  mediaCount: number;
  selectedIndex: number;
  handleDownload: (src: string, id: string) => void;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  background-color: rgba(0, 0, 0, 0.9);
  outline: none;
  z-index: 300;
`;

const ImageContainer = styled.div<{ zoom: boolean }>`
  display: flex;
  align-items: center;
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
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
  height: 1.6rem;
  width: 1.6rem;

  @media (max-width: 735px) {
    height: 1.4rem;
    width: 1.4rem;
  }
`;

const Icons = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;

  @media (max-width: 735px) {
    div {
      padding: 0.8rem;
    }
  }
`;

const DownloadIcon = styled.div`
  z-index: 150;
  padding: 1.5rem;
  transform: scale(1.1);

  :hover {
    cursor: pointer;
  }
`;

const CloseIcon = styled.div`
  z-index: 150;
  padding: 1.5rem;

  :hover {
    cursor: pointer;
  }
`;

const amplitude = 2;
const intercept = 0.9;

const ImageModal: React.FC<Props> = ({
  src,
  id,
  mediaCount,
  selectedIndex,
  handleDownload,
}) => {
  const dispatch = useAppDispatch();

  const [zoom, setZoom] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transparency, setTransparency] = useState(intercept);
  const [reset, setReset] = useState(false);
  const [resetingPan, setResetingPan] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const imageContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    if (container.current) {
      container.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!reset) {
      setReset(true);
    }
  }, [src]);

  const handleArrowChange = (side: string) => {
    if (side === 'right') {
      if (selectedIndex + 1 < mediaCount) {
        dispatch(setSelectedMediaIndex(selectedIndex + 1));
        setReset(false);
      }
    } else if (side === 'left') {
      if (selectedIndex - 1 >= 0) {
        dispatch(setSelectedMediaIndex(selectedIndex - 1));
        setReset(false);
      }
    }
  };

  const handleDragClose = (e: any) => {
    if (imageContainer.current && e.scale === 1) {
      if (Math.abs(e.positionY / imageContainer.current.offsetHeight) >= 0.3) {
        dispatch(setShowMedia(false));
      } else {
        setResetingPan(true);
        setTransparency(intercept);
        clearTimeout(timer);
        const timeout = setTimeout(() => {
          setResetingPan(false);
        }, 400);
        setTimer(timeout);
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
    if (imageContainer.current && e.scale === 1) {
      const val =
        Math.abs(e.positionY / imageContainer.current.offsetHeight) *
          -amplitude +
        intercept;
      setTransparency(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      if (selectedIndex + 1 < mediaCount) {
        dispatch(setSelectedMediaIndex(selectedIndex + 1));
        setReset(false);
      }
    } else if (e.key === 'ArrowLeft') {
      if (selectedIndex - 1 >= 0) {
        dispatch(setSelectedMediaIndex(selectedIndex - 1));
        setReset(false);
      }
    } else if (e.key === 'Escape') {
      dispatch(setShowMedia(false));
    }
  };

  const handleClick = (e: any) => {
    if (imageContainer && imageContainer.current) {
      if (
        imageContainer.current.contains(e.target) ||
        e.target.className.includes('Icon')
      ) {
        // inside click
        return;
      }
      // outside click
      dispatch(setShowMedia(false));
    }
  };

  return (
    <Container
      style={{
        backgroundColor: `rgba(0,0,0,${transparency})`,
        transition: resetingPan ? '400ms ease-out' : '',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={1}
      ref={container}
    >
      <Icons>
        <DownloadIcon onClick={() => handleDownload(src, id)}>
          <Icon src="/icons/download.svg" alt="close icon" />
        </DownloadIcon>
        <CloseIcon onClick={() => dispatch(setShowMedia(false))}>
          <Icon src="/icons/cancel.svg" alt="close icon" />
        </CloseIcon>
      </Icons>
      {selectedIndex > 0 && (
        <IconContainer
          onClick={() => handleArrowChange('left')}
          style={{ left: 0 }}
        >
          <Icon src="/icons/prev.svg" alt="prev icon" />
        </IconContainer>
      )}
      <ImageContainer ref={imageContainer} zoom={zoom}>
        <TransformWrapper
          scale={reset ? undefined : 1}
          positionX={reset ? undefined : 0}
          positionY={reset ? undefined : 0}
          doubleClick={{ mode: zoom ? 'reset' : 'zoomIn', step: 30 }}
          pan={{ lockAxisX: !zoom }}
          onPanningStop={handleDragClose}
          onPanning={handleTransparency}
          onZoomChange={handleZoom}
        >
          <TransformComponent>
            <StyledImage src={src} key={src} />
          </TransformComponent>
        </TransformWrapper>
      </ImageContainer>
      {selectedIndex + 1 < mediaCount && (
        <IconContainer
          onClick={() => handleArrowChange('right')}
          style={{ right: 0 }}
        >
          <Icon src="/icons/next.svg" alt="next icon" />
        </IconContainer>
      )}
    </Container>
  );
};

export default ImageModal;
