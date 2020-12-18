import React from 'react';
import styled from 'styled-components';

interface Props {
  name: string;
  username: string;
  profilePicUrl: string;
}

const ListItem = styled.li`
  display: flex;
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
  margin: 0;
  padding: 0.5rem 2rem;
  border-bottom: 1px solid #dbdbdb;
  cursor: pointer;

  :last-child {
    border: none;
  }

  :hover {
    background-color: #fafafa;
  }
`;

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
    color: #8e8e8e;
    font-weight: 300;
  }
`;

const UserListItem: React.FC<Props> = ({ name, username, profilePicUrl }) => {
  return (
    <ListItem>
      <ProfilePic src={profilePicUrl} />
      <UserInfo>
        <div className="name">{name}</div>
        <div className="username">{username}</div>
      </UserInfo>
    </ListItem>
  );
};

export default UserListItem;
