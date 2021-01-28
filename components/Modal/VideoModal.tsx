import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ReactPlayer from 'react-player';

interface Props {
  src: string;
  mediaCount: number;
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  background-color: rgba(0, 0, 0, 0.9);
  outline: none;
  z-index: 300;
`;

const VideoContainer = styled.div`
  margin: auto;

  video {
    max-height: 100vh;
  }
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
  top: 0;
  right: 0;
  z-index: 150;
  padding: 1.5rem;

  :hover {
    cursor: pointer;
  }

  img {
    height: 1.5rem;
    width: 1.5rem;
  }
`;

const VideoModal: React.FC<Props> = ({
  src,
  mediaCount,
  selected,
  setSelected,
  setShow,
}) => {
  const [reset, setReset] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
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
      if (selected + 1 < mediaCount) {
        setSelected((prev) => prev + 1);
        setReset(false);
      }
    } else if (side === 'left') {
      if (selected - 1 >= 0) {
        setSelected((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        setReset(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      if (selected + 1 < mediaCount) {
        setSelected((prev) => prev + 1);
        setReset(false);
      }
    } else if (e.key === 'ArrowLeft') {
      if (selected - 1 >= 0) {
        setSelected((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        setReset(false);
      }
    } else if (e.key === 'Escape') {
      setShow(false);
    }
  };

  const handleClick = (e: any) => {
    if (node && node.current) {
      if (
        node.current.contains(e.target) ||
        e.target.className.includes('Icon')
      ) {
        // inside click
        return;
      }
      // outside click
      setShow(false);
    }
  };

  return (
    <Container onKeyDown={handleKeyDown} tabIndex={1} ref={container}>
      <CloseIcon onClick={() => setShow(false)}>
        <Icon src="/icons/cancel.svg" alt="close icon" />
      </CloseIcon>
      {selected > 0 && (
        <IconContainer
          onClick={() => handleArrowChange('left')}
          style={{ left: 0 }}
        >
          <Icon src="/icons/prev.svg" alt="prev icon" />
        </IconContainer>
      )}
      <VideoContainer ref={node}>
        <ReactPlayer
          url={src}
          controls={true}
          loop
          width="100%"
          height="100%"
        />
      </VideoContainer>
      {selected + 1 < mediaCount && (
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

export default VideoModal;
