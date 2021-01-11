import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-spinner-material';
import {
  User,
  Users,
  UserResponse,
  MediaResponse,
  PageInfo,
  Display,
} from '../../interfaces/index';
import { bakeDisplayList, mediaUrl } from '../../utils';
import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import PictureModal from '../../components/PictureModal';
import Profile from '../../components/Profile';
import Grid from '../../components/Grid';

const Center = styled.div`
  max-width: ${(props) => props.theme.dimensions.maxWidth}px;
  margin: 0 auto;
  padding: 0 20px;
  margin-top: 54px;

  @media (max-width: 735px) {
    padding: 0;
  }
`;

const Error = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 300;
  padding: 3rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const Button = styled.button`
  font-size: 1.2rem;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 4px;
  padding: 1rem 2rem;
  text-align: center;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};
  :hover {
    cursor: pointer;
    color: #000;
  }
`;

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(0);
  const [displayList, setDisplayList] = useState<Display[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [user, setUser] = useState<User>();
  const [reset, setReset] = useState(false);

  useEffect(() => {
    const userSource = axios.CancelToken.source();
    const mediaSource = axios.CancelToken.source();

    const init = async () => {
      setLoading(true);
      try {
        const userRes = await axios.get<UserResponse>(
          `https://www.instagram.com/web/search/topsearch/?query=${username}`,
          {
            cancelToken: userSource.token,
          }
        );
        console.log(userRes.data);
        const currentUser = userRes.data.users.find(
          (users: Users) => users.user.username === username
        );
        console.log(currentUser);
        if (currentUser) {
          setUser(currentUser.user);
          if (!currentUser.user.is_private) {
            const mediaRes = await axios.get<MediaResponse>(
              mediaUrl(currentUser.user.pk),
              {
                cancelToken: mediaSource.token,
              }
            );
            const display = bakeDisplayList(
              mediaRes.data.data.user.edge_owner_to_timeline_media.edges
            );
            setPageInfo(
              mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
            );
            setDisplayList(display);
          } else {
            if (pageInfo) {
              setPageInfo(undefined);
            }
            if (displayList) {
              setDisplayList([]);
            }
          }
        } else {
          throw '404';
        }
        if (error) {
          setError('');
        }
      } catch (e) {
        console.log(e);
        if (pageInfo) {
          setPageInfo(undefined);
        }
        if (displayList) {
          setDisplayList([]);
        }
        if (e === '404') {
          setError('User not found.');
        } else {
          setError('Something went wrong, try again later.');
        }
      }
      setLoading(false);
    };
    if (username) {
      init();
    }
    return () => {
      userSource.cancel();
      mediaSource.cancel();
    };
  }, [username]);

  const handleSelect = (index: number) => {
    setSelected(index);
    setShow(true);
  };

  const handleLoadMore = async () => {
    if (user && pageInfo) {
      if (pageInfo.has_next_page) {
        setLoadingMore(true);
        try {
          const mediaRes = await axios.get<MediaResponse>(
            mediaUrl(user.pk, pageInfo.end_cursor)
          );
          const display = bakeDisplayList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            displayList.length
          );
          setPageInfo(
            mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
          );
          setDisplayList((prev) => [...prev, ...display]);
        } catch (err) {
          console.log(err);
        }
        setLoadingMore(false);
      }
    }
  };

  let main;
  if (error) {
    main = <Error>{error}</Error>;
  } else if (user?.is_private) {
    main = <Error>This account is private.</Error>;
  } else {
    main = (
      <Grid user={user} displayList={displayList} handleSelect={handleSelect} />
    );
  }

  let renderButton;
  if (loadingMore) {
    renderButton = (
      <Spinner radius={64} color={'#ff0078'} stroke={6} visible={true} />
    );
  } else {
    renderButton = <Button onClick={handleLoadMore}>Load more</Button>;
  }

  let render;
  if (loading) {
    render = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '3rem 0',
          marginTop: 54,
        }}
      >
        <Spinner radius={64} color={'#ff0078'} stroke={6} visible={true} />
      </div>
    );
  } else {
    render = (
      <Center>
        {!error && <Profile user={user} />}
        {main}
        {pageInfo?.has_next_page && (
          <ButtonContainer>{renderButton}</ButtonContainer>
        )}
        {show && (
          <PictureModal
            src={displayList[selected].src}
            mediaCount={displayList.length}
            selected={selected}
            reset={reset}
            setReset={setReset}
            setSelected={setSelected}
            setShow={setShow}
          />
        )}
      </Center>
    );
  }

  return (
    <Layout
      title={`${
        user?.full_name ? user?.full_name + ' | Fotogram' : '' + 'Fotogram'
      } `}
    >
      <Navbar />
      {render}
    </Layout>
  );
};

export default UserProfile;
