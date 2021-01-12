import React from 'react';
import styled from 'styled-components';
import { User, Story } from '../interfaces';
import Share from './Share';

interface Props {
  user: User | undefined;
  stories: Story[];
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

const Profile: React.FC<Props> = ({ user, stories }) => {
  return (
    <Container hasStories={stories.length > 0}>
      <div className="profile-pic-container">
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
    </Container>
  );
};

export default Profile;
