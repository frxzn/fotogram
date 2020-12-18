import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import UserListItem from './UserListItem';

interface User {
  pk: string;
  full_name: string;
  username: string;
  profile_pic_url: string;
  is_private: boolean;
}

interface Users {
  user: User;
}

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  display: flex;
  align-items: center;
`;

const Icon = styled.img`
  height: 1rem;
  width: 1rem;
  margin: 0 1rem;
`;

const Close = styled.img`
  height: 1.2rem;
  width: 1.2rem;
  margin: 0 1rem;

  :hover {
    cursor: pointer;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  height: 2rem;
  font-size: 1.2rem;
  border: none;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};

  :focus {
    outline: none;
  }
`;

const SearchButton = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  color: #fff;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 0 1rem;
  border-radius: 0 2px 2px 0;
  font-weight: bold;
  cursor: pointer;

  :hover,
  :focus {
    background-color: #c8005e;
  }
`;

const UserList = styled.ul`
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  background-color: #fff;
  width: 100%;
  max-width: 800px;
  margin-top: 1rem;
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
`;

const SearchBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState<Users[]>([]);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const search = async () => {
      try {
        if (input.length) {
          if (!loading) {
            setLoading(true);
          }
          const res = await axios.get(
            `https://www.instagram.com/web/search/topsearch/?query=${input}`,
            {
              cancelToken: source.token,
            }
          );
          console.log(res.data.users);
          if (res.data.users) {
            setSearchList(res.data.users);
          }
          setLoading(false);
        } else {
          setSearchList([]);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    };
    search();
    return () => source.cancel();
  }, [input]);

  useEffect(() => {
    if (input.length) {
      if (!show && searchList?.length && !closed) {
        setShow(true);
      }
    } else {
      setShow(false);
    }
  }, [input, show, searchList, closed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFocus = () => {
    setClosed(false);
  };

  const handleClick = (e: any) => {
    if (node && node.current) {
      if (node.current.contains(e.target)) {
        // inside click
        return;
      }
      // outside click
      setClosed(true);
      setShow(false);
    }
  };

  const renderList = searchList
    ?.filter(({ user }) => !user.is_private)
    .map(({ user }) => {
      return (
        <UserListItem
          key={user.pk}
          name={user.full_name}
          username={user.username}
          profilePicUrl={user.profile_pic_url}
        />
      );
    });

  let renderSpinner;
  if (loading && input.length !== 0) {
    renderSpinner = (
      <Spinner
        animation="border"
        size="sm"
        style={{
          color: '#ff0078',
          borderColor: '#ff0078',
          borderRightColor: '#fff',
          margin: '0 1rem',
        }}
      />
    );
  }

  let renderClose;
  if (!loading && input.length !== 0) {
    renderClose = <Close src="/icons/close.svg" onClick={() => setInput('')} />;
  }

  return (
    <Center>
      <div ref={node} style={{ width: '100%', maxWidth: '800px' }}>
        <SearchContainer>
          <Icon
            className="icon"
            src="/icons/magnifying-glass.svg"
            alt="magnifying glass icon"
          />
          <StyledInput
            value={input}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Search User..."
          />
          {renderSpinner}
          {renderClose}
          <SearchButton tabIndex={0} role="button">
            Search
          </SearchButton>
        </SearchContainer>
        {show && <UserList>{renderList}</UserList>}
      </div>
    </Center>
  );
};

export default SearchBar;
