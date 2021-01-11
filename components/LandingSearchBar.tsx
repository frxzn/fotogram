import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-spinner-material';
import { Users } from '../interfaces/index';
import UserListItem from './UserListItem';

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
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
`;

const UserList = styled.div`
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  background-color: #fff;
  width: 100%;
  max-width: ${(props) => props.theme.dimensions.maxWidth}px;
  margin-top: 1rem;
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
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

const SearchBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [searchList, setSearchList] = useState<Users[]>([]);
  const node = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    search();
    return () => source.cancel();
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

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.length && searchList.length && !loading) {
      router.push(`/user/${searchList[0].user.username}`);
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
        <Spinner radius={16} color={'#ff0078'} stroke={2} visible={true} />
      </div>
    );
  }

  let renderClose;
  if (!loading && input.length !== 0) {
    renderClose = <Close src="/icons/close.svg" onClick={() => setInput('')} />;
  }

  return (
    <Center>
      <div ref={node} style={{ width: '100%', maxWidth: '935px' }}>
        <Checkbox>
          <input
            type="checkbox"
            id="scales"
            name="scales"
            checked={checked}
            onChange={handleCheck}
          />
          <label htmlFor="scales">Hide private accounts</label>
        </Checkbox>
        <form onSubmit={handleSubmit}>
          <SearchContainer>
            <Icon
              src="/icons/magnifying-glass.svg"
              alt="magnifying glass icon"
            />
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
      </div>
    </Center>
  );
};

export default SearchBar;
