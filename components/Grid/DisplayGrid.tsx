import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import fileDownload from 'js-file-download';
import Spinner from 'react-spinner-material';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import {
  setSelectedMediaIndex,
  setDownloadMode,
} from '../../slices/UserInterfaceSlice';
import {
  loadMore,
  selectAll,
  closeDownload,
  selectOne,
} from '../../slices/apiSlice';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';
import TabNavigation from '../TabNavigation';
import DownloadControls from '../DownloadControls';
import { Multimedia } from '../../interfaces';
import { useRouter } from 'next/router';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;

  @media (max-width: 735px) {
    padding: 2rem 0;
  }
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

const Error = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 300;
  padding: 3rem 0;
  margin: 0 1rem;
`;

const DisplayGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.api.user);
  const pageInfo = useSelector((state: RootState) => state.api.pageInfo);
  const images = useSelector((state: RootState) => state.api.images);
  const videos = useSelector((state: RootState) => state.api.videos);
  const loadingMore = useSelector((state: RootState) => state.api.loadingMore);
  const downloadMode = useSelector(
    (state: RootState) => state.userInterface.downloadMode
  );
  const selectedTab = useSelector(
    (state: RootState) => state.userInterface.selectedTab
  );

  const handleLoadMore = async () => {
    if (user && pageInfo) {
      if (pageInfo.has_next_page) {
        dispatch(
          loadMore({
            pk: user.pk,
            endCursor: pageInfo.end_cursor,
            imagesCount: images.length,
            videosCount: videos.length,
          })
        );
      }
    }
  };

  const handleSelectAll = () => {
    dispatch(selectAll(selectedTab));
  };

  const handleCloseDownload = () => {
    dispatch(closeDownload(selectedTab));
    dispatch(setDownloadMode(false));
  };

  const handleDownload = async () => {
    const list = selectedTab === 'images' ? images : videos;
    const extension = selectedTab === 'images' ? '.png' : '.mp4';

    const downloadArray = list
      .filter((item) => item.selected)
      .map((item) => {
        return {
          url: item.src,
          file: item.id + extension,
        };
      });

    try {
      const res = await axios.post(
        'http://18.191.46.59:3000/download',
        downloadArray,
        {
          responseType: 'blob',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      fileDownload(res.data, 'fotogram.zip');
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = (item: Multimedia) => {
    if (!downloadMode) {
      dispatch(setSelectedMediaIndex(item.index));
      if (user) {
        router.push(
          `/${user.username}?shortcode=${item.shortcode}`,
          `/${user.username}/${item.shortcode}`
        );
      }
    } else {
      dispatch(selectOne({ selectedTab, item }));
    }
  };

  let render;
  if (selectedTab === 'images') {
    if (images.length) {
      render = <ImageGrid handleClick={handleClick} />;
    } else {
      if (pageInfo?.has_next_page) {
        render = <Error>No hay fotos para mostrar, intenta cargando más</Error>;
      } else {
        render = <Error>Este usuario aún no ha publicado fotos</Error>;
      }
    }
  } else if (selectedTab === 'videos') {
    if (videos.length) {
      render = <VideoGrid handleClick={handleClick} />;
    } else {
      if (pageInfo?.has_next_page) {
        render = (
          <Error>No hay videos para mostrar, intenta cargando más</Error>
        );
      } else {
        render = <Error>Este usuario aún no ha publicado videos</Error>;
      }
    }
  }

  let renderButton;
  if (loadingMore) {
    renderButton = (
      <Spinner radius={64} color={'#ff0078'} stroke={6} visible={true} />
    );
  } else {
    renderButton = <Button onClick={handleLoadMore}>Cargar más</Button>;
  }

  return (
    <>
      <TabNavigation
        selectedTab={selectedTab}
        handleCloseDownload={handleCloseDownload}
      />
      {render}
      {pageInfo?.has_next_page && (
        <ButtonContainer>{renderButton}</ButtonContainer>
      )}
      <DownloadControls
        listCount={selectedTab === 'images' ? images.length : videos.length}
        handleSelectAll={handleSelectAll}
        handleCloseDownload={handleCloseDownload}
        selectedCount={
          selectedTab === 'images'
            ? images.filter((img) => img.selected).length
            : videos.filter((vid) => vid.selected).length
        }
        handleDownload={handleDownload}
      />
    </>
  );
};

export default DisplayGrid;
