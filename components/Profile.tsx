import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
// import Stories from 'react-insta-stories';
import { User, FormattedStory } from '../interfaces';
import Share from './Share';

interface Props {
  user: User | undefined;
  stories: FormattedStory[];
}

interface ContainerProps {
  hasStories: boolean;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;

  .profile-pic-container {
    border-radius: 50%;
    background: ${(props) =>
      props.hasStories
        ? 'radial-gradient(ellipse at 30% 70%, #ffa546 15%, #c42286 100%)'
        : ''};
    padding: 3px;
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    position: relative;
  }

  span {
    position: absolute;
    top: 1px;
    right: -8px;
    color: #fafafa;
    border: 2px solid #fafafa;
    background-color: #e66666;
    width: 22px;
    height: 22px;
    font-weight: 700;
    font-size: 0.8rem;
    white-space: nowrap;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-pic {
    border-radius: 50%;
    border: 3px solid #fafafa;
    width: 66px;
    height: 66px;
  }

  .profile-right-side {
    display: flex;
    align-items: center;

    @media (max-width: 735px) {
      flex-direction: column;
      align-items: flex-start;
      font-size: 1rem;
    }

    a {
      color: ${(props) => props.theme.colors.primaryText};

      :hover {
        color: #000;
      }
    }
  }
`;

const Modal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 300;
  background-color: rgba(0, 0, 0, 0.9);
  padding-bottom: 4rem;
`;

const StoriesContainer = styled.div`
  position: relative;
`;

const Close = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 1.2rem;
  right: 0.4rem;
  z-index: 1000;
  height: 2rem;
  width: 2rem;

  :hover {
    cursor: pointer;
  }
`;

const Icon = styled.img`
  height: 1.2rem;
  width: 1.2rem;
`;

const Stories = dynamic(() => import('react-insta-stories'), { ssr: false });

const Profile: React.FC<Props> = ({ user, stories }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleClick = () => {
    if (stories.length) {
      setShow(true);
    }
  };

  return (
    <Container hasStories={stories.length > 0}>
      <div className="profile-pic-container" onClick={handleClick}>
        <img
          className="profile-pic"
          src={user?.profile_pic_url}
          alt="instagram profile picture"
        />
        {stories.length > 0 && <span>{stories.length}</span>}
      </div>
      <div className="profile-right-side">
        <a href={`https://www.instagram.com/${user?.username}`} target="blank">
          @{user?.username}
        </a>
        <Share />
      </div>
      {show && (
        <Modal>
          <StoriesContainer>
            <Stories
              stories={stories}
              onAllStoriesEnd={() => setShow(false)}
              keyboardNavigation={true}
            />
            <Close onClick={() => setShow(false)}>
              <Icon src="/icons/cancel.svg" alt="close icon" />
            </Close>
          </StoriesContainer>
        </Modal>
      )}
    </Container>
  );
};

export default Profile;
