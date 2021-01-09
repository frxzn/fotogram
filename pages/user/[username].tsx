import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
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

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  font-size: 1.75em;

  img {
    border-radius: 50%;
    margin: 1rem 0;
  }

  a {
    color: ${(props) => props.theme.colors.primaryText};

    :hover {
      color: #000;
    }
  }

  @media (max-width: 735px) {
    font-size: 1.2em;

    img {
      width: 80px;
    }
  }
`;

const Center = styled.div`
  max-width: ${(props) => props.theme.dimensions.maxWidth}px;
  margin: 0 auto;
  padding: 0 20px;
  margin-top: 54px;

  @media (max-width: 735px) {
    padding: 0;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 28px;
  margin: 28px 0;

  @media (max-width: 735px) {
    grid-gap: 3px;
  }
`;

const GridItem = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  ::after {
    content: '';
    padding-bottom: 100%;
    display: block;
  }

  :hover {
    cursor: pointer;
    filter: brightness(calc(2 / 3));
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;

  :hover {
    cursor: pointer;
  }
`;

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;

  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState(false);
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
            const display = bakeDisplayList(
              mediaRes.data.data.user.edge_owner_to_timeline_media.edges
            );
            setPageInfo(
              mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
            );
            setDisplayList(display);
          }
        }
        if (error) {
          setError(false);
        }
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    };
    init();
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
      }
    }
  };

  return (
    <Layout title={`${user?.full_name} | Fotogram`}>
      <Navbar />
      {!loading && (
        <Center>
          <Profile>
            <img
              src={user?.profile_pic_url}
              alt={`${user?.full_name}'s profile picture`}
            />
            <a href={`https://www.instagram.com/${username}`} target="blank">
              @{username}
            </a>
          </Profile>
          <GridContainer>
            {displayList.map((picture) => (
              <GridItem
                key={picture.id}
                onClick={() => handleSelect(picture.index)}
              >
                <StyledImage
                  src={picture.src}
                  alt={`${user?.full_name}'s photo`}
                />
              </GridItem>
            ))}
          </GridContainer>
          {pageInfo?.has_next_page && (
            <button onClick={handleLoadMore}>Load More</button>
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
      )}
    </Layout>
  );
};

export default UserProfile;
