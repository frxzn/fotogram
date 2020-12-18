import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import UserListItem from './UserListItem';

interface Props {}

const Center = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  border: 1px solid ${(props) => props.theme.colors.primary};
  display: flex;
  align-items: center;
  border-radius: 6px;
`;

const Icon = styled.img`
  height: 1rem;
  width: 1rem;
  margin: 0 1rem;
`;

const Close = styled.img`
  height: 1.2rem;
  width: 1.2rem;
  margin-right: 1rem;

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
`;

const List = styled.ul`
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: #fff;
  width: 100%;
  max-width: 800px;
  margin-top: 1rem;
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
`;

const SearchBar: React.FC<Props> = () => {
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState<any[]>([]);
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
        if (!loading) {
          setLoading(true);
        }
        const res = await axios.get(
          `https://www.instagram.com/web/search/topsearch/?query=${input}`,
          {
            cancelToken: source.token,
          }
        );
        setSearchList(res.data.users);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) return;
      }
    };
    search();
    return () => source.cancel();
  }, [input]);

  useEffect(() => {
    if (input.length && searchList.length && !closed) {
      if (!show) {
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

  let renderList = searchList.map(({ user }) => {
    return (
      <UserListItem
        key={user.pk}
        name={user.full_name}
        username={user.username}
        profilePicUrl={user.profile_pic_url}
      />
    );
  });

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
          {loading && input.length !== 0 && (
            <Spinner
              animation="border"
              size="sm"
              style={{
                color: '#ff0078',
                borderColor: '#ff0078',
                borderRightColor: '#fff',
                marginRight: '1rem',
              }}
            />
          )}
          {!loading && input.length !== 0 && (
            <Close src="/icons/close.svg" onClick={() => setInput('')} />
          )}
          <SearchButton>Search</SearchButton>
        </SearchContainer>
        {show && <List>{renderList}</List>}
      </div>
    </Center>
  );
};

export default SearchBar;
