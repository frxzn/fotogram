import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import classes from '../styles/anchor.module.css';

interface Props {
  name: string;
  username: string;
  profilePicUrl: string;
}

const ProfilePic = styled.img`
  height: 32px;
  width: 32px;
  border-radius: 50%;
  margin-right: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
  font-size: 14px;

  .name {
    color: ${(props) => props.theme.colors.primaryText};
    font-weight: 600;
  }

  .username {
    color: ${(props) => props.theme.colors.secondaryText};
    font-weight: 300;
  }
`;

const UserListItem: React.FC<Props> = ({ name, username, profilePicUrl }) => {
  return (
    <Link href={`/user/${username}`}>
      <a className={classes.anchor}>
        <ProfilePic src={profilePicUrl} />
        <UserInfo>
          <div className="name">{name}</div>
          <div className="username">{username}</div>
        </UserInfo>
      </a>
    </Link>
  );
};

export default UserListItem;
