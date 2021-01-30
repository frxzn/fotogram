import React from 'react';
import styled from 'styled-components';
import { User } from '../interfaces';
import Share from './Share';

interface Props {
  user: User | undefined;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;

  .profile-pic {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin-right: 1rem;

    @media (max-width: 735px) {
      width: 70px;
      height: 70px;
    }
  }

  .profile-right-side {
    display: flex;
    align-items: center;
    font-size: 1.2rem;

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

const Profile: React.FC<Props> = ({ user }) => {
  return (
    <Container>
      <img
        className="profile-pic"
        src={user?.profile_pic_url}
        alt={`Foto de perfil de ${user?.full_name}`}
      />
      <div className="profile-right-side">
        <a href={`https://www.instagram.com/${user?.username}`} target="blank">
          {user?.username}
        </a>
        <Share />
      </div>
    </Container>
  );
};

export default Profile;
