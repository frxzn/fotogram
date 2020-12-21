import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import { Users, UserResponse, MediaResponse } from '../../interfaces/index';
import Layout from '../../components/Layout';
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
    /* font-size: 1.75em; */
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
  max-width: 935px;
  margin: 0 auto;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 28px;
  margin: 28px;

  @media (max-width: 735px) {
    grid-gap: 3px;
    margin: 3px;
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

const mediaUrl = (pk: string) => {
  return `https://www.instagram.com/graphql/query?query_hash=6305d415e36c0a5f0abb6daba312f2dd&variables={"id":${pk},"first":50,"after":""}`;
};

const User: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;

  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState(false);
  const [noMedia, setNoMedia] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [displayList, setDisplayList] = useState<string[]>([]);

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
          setFullName(currentUser.user.full_name);
          setProfilePicUrl(currentUser.user.profile_pic_url);
          if (!currentUser.user.is_private) {
            const mediaRes = await axios.get<MediaResponse>(
              mediaUrl(currentUser.user.pk),
              {
                cancelToken: mediaSource.token,
              }
            );
            const display = mediaRes.data.data.user.edge_owner_to_timeline_media.edges
              .filter((item) => !item.node.is_video)
              .map(
                (item) =>
                  item.node.display_resources[
                    item.node.display_resources.length - 1
                  ].src
              );
            console.log(display);
            setDisplayList(display);
          } else {
            setIsPrivate(currentUser.user.is_private);
          }
        }
        setError(false);
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

  const handleSelect = (src: string) => {
    setSelected(src);
    setShow(true);
  };

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <Center>
        <Profile>
          <img src={profilePicUrl} />
          <a href={`https://www.instagram.com/${username}`} target="blank">
            @{username}
          </a>
        </Profile>
        <GridContainer>
          {displayList.map((src) => (
            <GridItem onClick={() => handleSelect(src)}>
              <StyledImage src={src} />
            </GridItem>
          ))}
        </GridContainer>
        {show && <PictureModal src={selected} />}
      </Center>
    </Layout>
  );
};

export default User;
