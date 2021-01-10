import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import { Users } from '../interfaces/index';
import UserListItem from './UserListItem';
import { useMediaQuery } from 'react-responsive';

const Center = styled.div`
  width: 100%;
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;

  @media (max-width: 735px) {
    /* padding: 0; */
  }
`;

const SearchContainer = styled.div`
  background-color: ${(props) => props.theme.colors.backgroundColor};
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  display: flex;
  align-items: center;
  position: relative;

  .spinner-border {
    color: #ff0078;
    border-color: #ff0078;
    border-right-color: #fafafa;
    margin: 0 1rem;
  }
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
  min-width: 50px;
  font-size: 1.2rem;
  border: none;
  background-color: ${(props) => props.theme.colors.backgroundColor};
  color: ${(props) => props.theme.colors.primaryText};

  :focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  align-self: stretch;
  color: #fff;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 0 1rem;
  border-radius: 0 2px 2px 0;
  border: none;
  font-weight: bold;
  cursor: pointer;

  :hover,
  :focus {
    background-color: #c8005e;
  }

  @media (max-width: 735px) {
    display: none;
  }
`;

const UserList = styled.div`
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  background-color: #fff;
  max-height: 260px;
  overflow: auto;
  padding: 0;
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  width: calc(100% - 40px);
  margin: auto;

  @media (max-width: 735px) {
    top: 46px;
    max-height: calc(100vh - 55px);
    width: 100%;
    border: none;
    border-radius: 0;
  }
`;

const SearchBar: React.FC = () => {
  const isMobile = useMediaQuery({ query: `(max-width: 735px)` });
  const router = useRouter();
  const { username } = router.query;
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState<Users[]>([]);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput('');
    setShow(false);
  }, [username]);

  useEffect(() => {
    if (show && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [show, isMobile]);

  // Effect to close modal on outsides click
  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  // Effect to fetch IG's search API
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
    const timer = setTimeout(() => {
      search();
    }, 500);
    return () => {
      source.cancel();
      clearTimeout(timer);
    };
  }, [input]);

  // Effect to open/close search modal
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.length && searchList.length && !loading) {
      router.push(`/user/${searchList[0].user.username}`);
    }
  };

  const renderList = searchList?.map(({ user }) => {
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
    renderSpinner = <Spinner animation="border" size="sm" />;
  }

  let renderClose;
  if (!loading && input.length !== 0) {
    renderClose = <Close src="/icons/close.svg" onClick={() => setInput('')} />;
  }

  return (
    <Center ref={node}>
      <form onSubmit={handleSubmit}>
        <SearchContainer>
          <Icon src="/icons/magnifying-glass.svg" alt="magnifying glass icon" />
          <StyledInput
            value={input}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Search"
          />
          {renderSpinner}
          {renderClose}
          <SearchButton type="submit">Search</SearchButton>
        </SearchContainer>
      </form>
      {show && <UserList>{renderList}</UserList>}
    </Center>
  );
};

export default SearchBar;
