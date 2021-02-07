import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Spinner from 'react-spinner-material';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { search } from '../slices/apiSlice';
import UserListItem from './UserListItem';
import Logo from './Logo';

const Center = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
`;

const SearchContainer = styled.form`
  background-color: ${(props) => props.theme.colors.backgroundColor};
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 1rem;
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
  width: 0 !important;
  height: 2rem;
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
  font-size: 0.9rem;
  letter-spacing: 1px;
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
    top: 43px;
    max-height: calc(100vh - 52px);
    width: 100%;
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.borderColor};
    border-bottom: 1px solid ${(props) => props.theme.colors.borderColor};
    border-radius: 0;
  }
`;

const StyledLabel = styled.label`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: `(max-width: 735px)` });
  const router = useRouter();
  const { username } = router.query;

  const searchList = useSelector((state: RootState) => state.api.searchList);
  const loading = useSelector((state: RootState) => state.api.searchLoading);

  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput('');
    setShow(false);
    setClosed(false);
  }, [username]);

  // Effect to prevent scroll on mobile screen when search modal is open
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

  useEffect(() => {
    let promise: any;
    const timer = setTimeout(() => {
      promise = dispatch(search(input));
    }, 500);
    return () => {
      if (promise) {
        promise.abort();
      }
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
      router.push(`/${searchList[0].user.username}`);
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
    renderSpinner = (
      <div style={{ margin: '0 1rem' }}>
        <Spinner radius={16} color={'#ff0078'} stroke={2} visible={true} />
      </div>
    );
  }

  let renderClose;
  if (!loading && input.length !== 0) {
    renderClose = <Close src="/icons/close.svg" onClick={() => setInput('')} />;
  }

  return (
    <Center ref={node}>
      <Logo />
      <SearchContainer onSubmit={handleSubmit}>
        <Icon src="/icons/magnifying-glass.svg" alt="magnifying glass icon" />
        <StyledLabel htmlFor="search-input">Search Instagram User</StyledLabel>
        <StyledInput
          value={input}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Buscar"
          id="search-input"
          autoComplete="off"
        />
        {renderSpinner}
        {renderClose}
        <SearchButton type="submit">Buscar</SearchButton>
      </SearchContainer>
      {show && <UserList>{renderList}</UserList>}
    </Center>
  );
};

export default SearchBar;
