import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import Spinner from 'react-spinner-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { search } from '../slices/apiSlice';
import UserListItem from './UserListItem';

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 4rem;
`;

const SearchContainer = styled.div`
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  display: flex;
  align-items: center;
  margin: 1rem 0;
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
  width: 0;
  height: 2rem;
  font-size: 1.2rem;
  border: none;
  background-color: transparent;
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
  overflow-y: auto;
  padding: 0;
  width: calc(100% - 40px);
  margin: auto;

  @media (max-width: 735px) {
    max-height: 60vh;
    width: 100%;
  }
`;

const Checkbox = styled.div`
  input {
    margin-right: 0.5rem;
    cursor: pointer;
  }

  label {
    color: ${(props) => props.theme.colors.secondaryText};
    font-weight: 300;
    cursor: pointer;
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

const DisplayError = styled.div`
  color: ${(props) => props.theme.colors.primaryText};
  font-size: 1.2rem;
  text-align: center;
  margin: 3rem 0;
`;

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMobile = useMediaQuery({ query: `(max-width: 735px)` });

  const searchList = useSelector((state: RootState) => state.api.searchList);
  const loading = useSelector((state: RootState) => state.api.searchLoading);
  const error = useSelector((state: RootState) => state.api.searchError);

  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [checked, setChecked] = useState(false);

  const node = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to close modal on outsides click
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    if (show && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [show, isMobile]);

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
    if (isMobile) {
      node.current?.scrollIntoView();
    }
    setInput(e.target.value);
  };

  const handleFocus = () => {
    if (isMobile) {
      node.current?.scrollIntoView();
    }
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

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.length && searchList.length && !loading) {
      router.push(`/${searchList[0].user.username}`);
    }
  };

  const renderList = searchList
    ?.filter(({ user }) => {
      if (checked) {
        return !user.is_private;
      } else {
        return user;
      }
    })
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
      <div style={{ margin: '0 1rem' }}>
        <Spinner
          id="spinner"
          radius={16}
          color={'#ff0078'}
          stroke={2}
          visible={true}
        />
      </div>
    );
  }

  let renderClose;
  if (!loading && input.length !== 0) {
    renderClose = (
      <Close
        id="close-icon"
        src="/icons/close.svg"
        onClick={() => setInput('')}
      />
    );
  }

  return (
    <Center>
      <div
        ref={node}
        style={{ width: '100%', maxWidth: '935px', paddingTop: '1rem' }}
      >
        <Checkbox>
          <input
            type="checkbox"
            id="scales"
            name="scales"
            checked={checked}
            onChange={handleCheck}
          />
          <label htmlFor="scales">Ocultar cuentas privadas</label>
        </Checkbox>
        <form onSubmit={handleSubmit}>
          <SearchContainer>
            <Icon
              src="/icons/magnifying-glass.svg"
              alt="magnifying glass icon"
            />
            <StyledLabel htmlFor="search-input">
              Search Instagram User
            </StyledLabel>
            <StyledInput
              value={input}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="Buscar"
              ref={inputRef}
              id="search-input"
              autoComplete="off"
            />
            {renderSpinner}
            {renderClose}
            <SearchButton type="submit">Buscar</SearchButton>
          </SearchContainer>
        </form>
        {error.length ? <DisplayError>{error}</DisplayError> : null}
        {!error.length && show && <UserList>{renderList}</UserList>}
      </div>
    </Center>
  );
};

export default SearchBar;
