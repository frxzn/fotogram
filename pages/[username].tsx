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
  Image,
  Video,
  // Story,
  // FormattedStory,
} from '../interfaces/index';
import { bakeImageList, bakeVideoList, mediaUrl } from '../utils';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import DisplayGrid from '../components/Grid/DisplayGrid';
import DisplayModal from '../components/Modal/DisplayModal';

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
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('images');
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<User>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [imageList, setImageList] = useState<Image[]>([]);
  const [videoList, setVideoList] = useState<Video[]>([]);
  // const [stories, setStories] = useState<FormattedStory[]>([]);

  useEffect(() => {
    const userSource = axios.CancelToken.source();
    const mediaSource = axios.CancelToken.source();

    const init = async () => {
      setLoading(true);
      setSelectedTab('images');
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

  // Load stories from russian api
  // useEffect(() => {
  //   setStories([]);
  //   const source = axios.CancelToken.source();

  //   if (user) {
  //     if (!user.is_private) {
  //       const loadStories = async () => {
  //         try {
  //           const res = await axios.post<Story[]>(
  //             'https://insta-stories.ru/api/stories',
  //             {
  //               xtrip: 'afsdfi3k4fdsd5gg',
  //               id: user.pk,
  //               username: user.username,
  //             },
  //             {
  //               cancelToken: source.token,
  //             }
  //           );

  //           const formattedStories = res.data.map((story) => ({
  //             url: story.is_video ? story.video : story.image,
  //             type: story.is_video ? 'video' : 'image',
  //           }));
  //           setStories(formattedStories);
  //         } catch (err) {
  //           if (axios.isCancel(err)) return;
  //         }
  //       };
  //       loadStories();
  //     }
  //   }
  //   return () => source.cancel();
  // }, [user]);

  const handleSelect = (index: number) => {
    setSelectedMediaIndex(index);
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
          const images = bakeImageList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            imageList.length
          );
          const videos = bakeVideoList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            videoList.length
          );
          setPageInfo(
            mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
          );
          setImageList((prev) => [...prev, ...images]);
          setVideoList((prev) => [...prev, ...videos]);
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
      <DisplayGrid
        user={user}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        imageList={imageList}
        videoList={videoList}
        handleSelect={handleSelect}
      />
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
        {!error && <Profile user={user} stories={[]} />}
        {main}
        {pageInfo?.has_next_page && (
          <ButtonContainer>{renderButton}</ButtonContainer>
        )}
        {show && (
          <DisplayModal
            imageList={imageList}
            videoList={videoList}
            selectedTab={selectedTab}
            selectedMediaIndex={selectedMediaIndex}
            setSelectedMediaIndex={setSelectedMediaIndex}
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
