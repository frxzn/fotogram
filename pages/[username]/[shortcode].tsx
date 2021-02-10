import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Owner, SingleMediaResponse } from '../../interfaces';
import { bakeFromSideCar, baseUrl } from '../../utils';
import Prev from '../../components/Icons/Prev';
import Next from '../../components/Icons/Next';
import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import Profile from '../../components/Profile';
import ShowImage from '../../components/Modal/ShowImage';
import Spinner from 'react-spinner-material';

const Center = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  margin: 54px auto 0 auto;
  padding-bottom: 3rem;

  @media (max-width: 735px) {
    padding: 0 0 1rem 0;
  }
`;

const VideoContainer = styled.div`
  margin: 0 auto;
  flex: 1;
  width: 100% !important;
  display: flex;
  justify-content: center;

  video {
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: calc(100vh - 54px) !important;
  }
`;

const Button = styled.a`
  font-size: 1.2rem;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 4px;
  padding: 1rem 2rem;
  margin-top: 3rem;
  align-self: center;
  text-align: center;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};
  :hover {
    cursor: pointer;
    color: #000;
  }
  @media (max-width: 735px) {
    margin-top: 1rem;
  }
`;

const DownloadButton = styled.button`
  font-size: 1.2rem;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 4px;
  padding: 1rem 2rem;
  align-self: center;
  text-align: center;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primaryText};
  margin: 0 auto;

  :hover {
    cursor: pointer;
    color: #000;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
`;

const IconContainer = styled.div<{ fill: string; disable: boolean }>`
  border: 2px solid #000;
  border: ${(props) => `2px solid ${props.fill}`};
  border-radius: 50%;
  height: 2.6rem;
  width: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  margin: 0 1rem;

  svg {
    height: 2.6rem;
  }

  :hover {
    cursor: ${(props) => (props.disable ? 'auto' : 'pointer')};
  }
`;

const Error = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 300;
  padding: 3rem 0;
  margin: 0 1rem;
`;

const singleMediaHash = '2c4c2e343a8f64c625ba02b2aa12c7f8';
const genericError = 'Algo salió mal. Intente nuevamente más tarde';

const Shortcode: React.FC = () => {
  const router = useRouter();
  const { username, shortcode } = router.query;

  const selectedTab = useSelector(
    (state: RootState) => state.userInterface.selectedTab
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<Owner>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<
    { src: string; index: number; id: string }[]
  >();
  const [videoSrc, setVideoSrc] = useState<string>();
  const [videoId, setVideoId] = useState<string>();
  const [isVideo, setIsVideo] = useState<boolean>();

  useEffect(() => {
    if (shortcode) {
      const init = async () => {
        try {
          if (!loading) {
            setLoading(true);
          }

          const res = await axios.get<SingleMediaResponse>(
            `${baseUrl}/graphql/query/?query_hash=${singleMediaHash}&variables={"shortcode":${JSON.stringify(
              shortcode
            )}}`
          );

          if (res.data.data.shortcode_media) {
            if (username === res.data.data.shortcode_media.owner.username) {
              setUser(res.data.data.shortcode_media.owner);
            } else {
              throw '400';
            }

            setIsVideo(res.data.data.shortcode_media.is_video);

            if (!res.data.data.shortcode_media.is_video) {
              if (res.data.data.shortcode_media.edge_sidecar_to_children) {
                const images = bakeFromSideCar(
                  res.data.data.shortcode_media.edge_sidecar_to_children.edges
                );
                setImages(images);
              } else {
                setImages([
                  {
                    src:
                      res.data.data.shortcode_media.display_resources[
                        res.data.data.shortcode_media.display_resources.length -
                          1
                      ].src,
                    index: 0,
                    id: res.data.data.shortcode_media.id,
                  },
                ]);
              }
            } else {
              if (res.data.data.shortcode_media.video_url) {
                setVideoSrc(res.data.data.shortcode_media.video_url);
                setVideoId(res.data.data.shortcode_media.id);
              }
            }
          } else {
            throw '404';
          }
          if (error) {
            setError('');
          }
          setLoading(false);
        } catch (err) {
          if (err === '404') {
            setError('Publicación no encontrada');
          } else if (err === '400') {
            setError('Enlace inválido');
          } else {
            setError(genericError);
          }
          setLoading(false);
        }
      };
      init();
    }
  }, [shortcode]);

  const handleDownload = (src: string, id: string) => {
    const extension = selectedTab === 'images' ? '.png' : '.mp4';

    axios({
      url: src,
      method: 'GET',
      responseType: 'blob', // important
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', id + extension);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.log(err));
  };

  const handleArrowChange = (side: string) => {
    if (images) {
      if (side === 'right') {
        if (currentIndex + 1 < images.length) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      } else if (side === 'left') {
        if (currentIndex - 1 >= 0) {
          setCurrentIndex((prevIndex) => prevIndex - 1);
        }
      }
    }
  };

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
    if (!error) {
      if (!user?.is_private) {
        // not private, could have media
        if (images?.length || videoSrc) {
          // has media to show
          if (!isVideo && images?.length) {
            // render image component
            const hasPrev = currentIndex - 1 >= 0;
            const hasNext = currentIndex + 1 < images.length;
            render = (
              <>
                <Controls>
                  {images.length > 1 && (
                    <IconContainer
                      disable={!hasPrev}
                      fill={hasPrev ? '#000' : '#EBEBE4'}
                      onClick={() => handleArrowChange('left')}
                    >
                      <Prev hexColor={hasPrev ? '#000' : '#EBEBE4'} />
                    </IconContainer>
                  )}
                  <DownloadButton
                    onClick={() =>
                      handleDownload(
                        images[currentIndex].src,
                        images[currentIndex].id
                      )
                    }
                  >
                    Descargar
                  </DownloadButton>
                  {images.length > 1 && (
                    <IconContainer
                      disable={!hasNext}
                      fill={hasNext ? '#000' : '#EBEBE4'}
                      onClick={() => handleArrowChange('right')}
                    >
                      <Next hexColor={hasNext ? '#000' : '#EBEBE4'} />
                    </IconContainer>
                  )}
                </Controls>
                <ShowImage src={images[currentIndex].src} />
              </>
            );
          } else {
            // render video component
            render = (
              <>
                <Controls>
                  <DownloadButton
                    onClick={() =>
                      handleDownload(videoSrc as string, videoId as string)
                    }
                  >
                    Descargar
                  </DownloadButton>
                </Controls>
                <ReactPlayer
                  key={videoSrc}
                  url={videoSrc}
                  controls={true}
                  loop
                  wrapper={VideoContainer}
                />
              </>
            );
          }
        } else {
          // render no media feedback message?
          render = <Error>{genericError}</Error>;
        }
      } else {
        // render private feedback message
        render = <Error>{genericError}</Error>;
      }
    } else {
      render = <Error>{error}</Error>;
    }
  }

  return (
    <Layout
      title={`${user?.username ? user?.username + ' | Fotogram' : 'Fotogram'} `}
    >
      <Navbar />
      <Center>
        {!error && !loading && <Profile user={user} />}
        {render}
        {!error && !loading && user?.username && (
          <Link href={`/${user.username}`}>
            <Button>Ver más publicaciones</Button>
          </Link>
        )}
      </Center>
    </Layout>
  );
};

export default Shortcode;
