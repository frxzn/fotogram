import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { setSelectedMediaIndex } from '../../slices/UserInterfaceSlice';

interface Props {
  src: string;
  id: string;
  prevShortcode: string | undefined;
  nextShortcode: string | undefined;
  mediaCount: number;
  selectedIndex: number;
  handleDownload: (src: string, id: string) => void;
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
    width: 100%;
    justify-content: flex-end;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 1) 20%,
      rgba(0, 0, 0, 0) 100%
    );
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

const VideoModal: React.FC<Props> = ({
  src,
  id,
  prevShortcode,
  nextShortcode,
  mediaCount,
  selectedIndex,
  handleDownload,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const username = useSelector(
    (state: RootState) => state.userInterface.username
  );

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

  const handleArrowChange = (side: string) => {
    if (side === 'right') {
      if (selectedIndex + 1 < mediaCount) {
        if (username && nextShortcode) {
          router.replace(
            `/${username}?shortcode=${nextShortcode}`,
            `/${username}/${nextShortcode}`
          );
        }
        dispatch(setSelectedMediaIndex(selectedIndex + 1));
      }
    } else if (side === 'left') {
      if (selectedIndex - 1 >= 0) {
        if (username && prevShortcode) {
          router.replace(
            `/${username}?shortcode=${prevShortcode}`,
            `/${username}/${prevShortcode}`
          );
        }
        dispatch(setSelectedMediaIndex(selectedIndex - 1));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      if (selectedIndex + 1 < mediaCount) {
        if (username && nextShortcode) {
          router.replace(
            `/${username}?shortcode=${nextShortcode}`,
            `/${username}/${nextShortcode}`
          );
        }
        dispatch(setSelectedMediaIndex(selectedIndex + 1));
      }
    } else if (e.key === 'ArrowLeft') {
      if (selectedIndex - 1 >= 0) {
        if (username && prevShortcode) {
          router.replace(
            `/${username}?shortcode=${prevShortcode}`,
            `/${username}/${prevShortcode}`
          );
        }
        dispatch(setSelectedMediaIndex(selectedIndex - 1));
      }
    } else if (e.key === 'Escape') {
      router.back();
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
      router.back();
    }
  };

  return (
    <Container onKeyDown={handleKeyDown} tabIndex={1} ref={container}>
      <Icons>
        <DownloadIcon onClick={() => handleDownload(src, id)}>
          <Icon src="/icons/download.svg" alt="close icon" />
        </DownloadIcon>
        <CloseIcon onClick={() => router.back()}>
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
      <VideoContainer ref={node}>
        <ReactPlayer
          key={src}
          url={src}
          controls={true}
          loop
          width="100%"
          height="100%"
        />
      </VideoContainer>
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

export default VideoModal;
