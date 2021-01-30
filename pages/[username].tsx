import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedTab, setDownloadMode } from '../slices/UserInterfaceSlice';
import { RootState } from '../store';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from 'react-spinner-material';
import { useMediaQuery } from 'react-responsive';
import {
  User,
  Users,
  UserResponse,
  MediaResponse,
  PageInfo,
  Image,
  Video,
} from '../interfaces';
import { bakeImageList, bakeVideoList, mediaUrl } from '../utils';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import DisplayGrid from '../components/Grid/DisplayGrid';
import DisplayModal from '../components/Modal/DisplayModal';

const Center = styled.div`
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  margin: 54px auto 0 auto;
  padding: 0 20px;

  @media (max-width: 735px) {
    padding: 0;
    margin: 54px auto 3px auto;
  }
`;

const Error = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 300;
  padding: 3rem 0;
  margin: 0 1rem;
`;

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { username } = router.query;
  const isMobile = useMediaQuery({ query: `(max-width: 735px)` });

  const showMedia = useSelector(
    (state: RootState) => state.userInterface.showMedia
  );
  const downloadMode = useSelector(
    (state: RootState) => state.userInterface.downloadMode
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [imageList, setImageList] = useState<Image[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);

  useEffect(() => {
    const HtmlCenter = document.getElementById('username-center');
    if (HtmlCenter) {
      if (isMobile) {
        if (downloadMode) {
          HtmlCenter.style.marginBottom = '57px';
        } else {
          HtmlCenter.style.marginBottom = '3px';
        }
      } else {
        if (downloadMode) {
          HtmlCenter.style.marginBottom = '54px';
        } else {
          HtmlCenter.style.marginBottom = '0';
        }
      }
    }
  }, [downloadMode]);

  useEffect(() => {
    const userSource = axios.CancelToken.source();
    const mediaSource = axios.CancelToken.source();

    const init = async () => {
      setLoading(true);
      dispatch(setSelectedTab('images'));
      dispatch(setDownloadMode(false));
      try {
        const userRes = await axios.get<UserResponse>(
          `https://www.instagram.com/web/search/topsearch/?query=${username}`,
          {
            cancelToken: userSource.token,
          }
        );

        const currentUser = userRes.data.users.find(
          (users: Users) => users.user.username === username
        );

        if (currentUser) {
          setUser(currentUser.user);
          if (!currentUser.user.is_private) {
            const mediaRes = await axios.get<MediaResponse>(
              mediaUrl(currentUser.user.pk),
              {
                cancelToken: mediaSource.token,
              }
            );

            const images = bakeImageList(
              mediaRes.data.data.user.edge_owner_to_timeline_media.edges
            );
            const videos = bakeVideoList(
              mediaRes.data.data.user.edge_owner_to_timeline_media.edges
            );
            setPageInfo(
              mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
            );
            setImageList(images);
            setVideoList(videos);
          } else {
            if (pageInfo) {
              setPageInfo(undefined);
            }
            if (imageList) {
              setImageList([]);
            }
            if (videoList) {
              setVideoList([]);
            }
          }
        } else {
          throw '404';
        }

        if (error) {
          setError('');
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (pageInfo) {
          setPageInfo(undefined);
        }
        if (imageList) {
          setImageList([]);
        }
        if (videoList) {
          setVideoList([]);
        }
        if (err === '404') {
          setError('Usuario no encontrado.');
        } else {
          setError('Algo salió mal, intenta nuevamente más tarde.');
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

  let main;
  if (error) {
    main = <Error>{error}</Error>;
  } else if (user?.is_private) {
    main = <Error>Esta cuenta es privada.</Error>;
  } else {
    main = (
      <DisplayGrid
        user={user}
        imageList={imageList}
        videoList={videoList}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        setImageList={setImageList}
        setVideoList={setVideoList}
        downloadMode={downloadMode}
      />
    );
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
      <Center id="username-center">
        {!error && <Profile user={user} />}
        {main}
        {showMedia && (
          <DisplayModal imageList={imageList} videoList={videoList} />
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
