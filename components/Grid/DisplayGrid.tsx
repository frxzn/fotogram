import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
// import fileDownload from 'js-file-download';
import Spinner from 'react-spinner-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setSelectedMediaIndex,
  setShowMedia,
  setDownloadMode,
} from '../../slices/userInterfaceSlice';
import { User, Image, Video, PageInfo, MediaResponse } from '../../interfaces';
import { bakeImageList, bakeVideoList, mediaUrl } from '../../utils';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';
import TabNavigation from '../TabNavigation';
import DownloadControls from '../DownloadControls';

interface Props {
  user: User | undefined;
  imageList: Image[];
  videoList: Video[];
  pageInfo: PageInfo | undefined;
  downloadMode: boolean;
  setImageList: React.Dispatch<React.SetStateAction<Image[]>>;
  setVideoList: React.Dispatch<React.SetStateAction<Video[]>>;
  setPageInfo: React.Dispatch<React.SetStateAction<PageInfo | undefined>>;
}

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

const DisplayGrid: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const selectedTab = useSelector(
    (state: RootState) => state.userInterface.selectedTab
  );

  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (props.user && props.pageInfo) {
      if (props.pageInfo.has_next_page) {
        setLoadingMore(true);
        try {
          const mediaRes = await axios.get<MediaResponse>(
            mediaUrl(props.user.pk, props.pageInfo.end_cursor)
          );
          const images = bakeImageList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            props.imageList.length
          );
          const videos = bakeVideoList(
            mediaRes.data.data.user.edge_owner_to_timeline_media.edges,
            props.videoList.length
          );
          props.setPageInfo(
            mediaRes.data.data.user.edge_owner_to_timeline_media.page_info
          );
          props.setImageList((prev) => [...prev, ...images]);
          props.setVideoList((prev) => [...prev, ...videos]);
        } catch (err) {
          console.log(err);
        }
        setLoadingMore(false);
      }
    }
  };

  const handleSelectAll = () => {
    // let list = imageList | videoList
    if (selectedTab === 'images') {
      const selectedCount = props.imageList.filter((image) => image.selected)
        .length;
      let selected: boolean;
      if (selectedCount < props.imageList.length) {
        selected = true;
      } else {
        selected = false;
      }
      props.setImageList((prevImageList) => {
        const newImageList = prevImageList.map((prevImage) => {
          return { ...prevImage, selected };
        });
        return newImageList;
      });
    } else if (selectedTab === 'videos') {
      const selectedCount = props.videoList.filter((video) => video.selected)
        .length;
      let selected: boolean;
      if (selectedCount < props.videoList.length) {
        selected = true;
      } else {
        selected = false;
      }
      props.setVideoList((prevVideoList) => {
        const newVideoList = prevVideoList.map((prevVideo) => {
          return { ...prevVideo, selected };
        });
        return newVideoList;
      });
    } else {
      console.error('invalid tab key');
    }
  };

  const handleCloseDownload = () => {
    // let list = imageList | videoList
    if (selectedTab === 'images') {
      props.setImageList((prevImageList) => {
        const newImageList = prevImageList.map((prevImage) => {
          return { ...prevImage, selected: false };
        });
        return newImageList;
      });
    } else if (selectedTab === 'videos') {
      props.setVideoList((prevVideoList) => {
        const newVideoList = prevVideoList.map((prevVideo) => {
          return { ...prevVideo, selected: false };
        });
        return newVideoList;
      });
    } else {
      console.error('invalid tab key');
    }
    dispatch(setDownloadMode(false));
  };

  const handleDownload = async () => {
    let downloadArray: { url: string; file: string }[];

    if (selectedTab === 'images') {
      downloadArray = props.imageList
        .filter((image) => image.selected)
        .map((image) => {
          return {
            url: image.src.high,
            file: image.id + '.png',
          };
        });
      // try {
      //   const res = await axios.post(
      //     'http://18.223.188.23:3000/download',
      //     downloadArray,
      //     {
      //       responseType: 'blob',
      //       headers: {
      //         'content-type': 'application/x-www-form-urlencoded',
      //       },
      //     }
      //   );
      //   fileDownload(res.data, 'fotogram.zip');
      // } catch (err) {
      //   console.log(err);
      // }
    } else {
      downloadArray = props.videoList
        .filter((video) => video.selected)
        .map((video) => {
          return {
            url: video.videoUrl,
            file: video.id + '.mp4',
          };
        });
    }

    downloadArray.forEach((item) => {
      axios({
        url: item.url,
        method: 'GET',
        responseType: 'blob', // important
      })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', item.file);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => console.log(err));
    });
  };

  const handleShowMedia = (index: number) => {
    dispatch(setSelectedMediaIndex(index));
    dispatch(setShowMedia(true));
  };

  let render;
  if (selectedTab === 'images') {
    if (props.imageList.length) {
      render = (
        <ImageGrid
          user={props.user}
          imageList={props.imageList}
          setImageList={props.setImageList}
          handleShowMedia={handleShowMedia}
          downloadMode={props.downloadMode}
        />
      );
    } else {
      if (props.pageInfo?.has_next_page) {
        render = <Error>No hay fotos para mostrar, intenta cargando más</Error>;
      } else {
        render = <Error>Este usuario aún no ha publicado fotos</Error>;
      }
    }
  } else if (selectedTab === 'videos') {
    if (props.videoList.length) {
      render = (
        <VideoGrid
          user={props.user}
          videoList={props.videoList}
          setVideoList={props.setVideoList}
          handleShowMedia={handleShowMedia}
          downloadMode={props.downloadMode}
        />
      );
    } else {
      if (props.pageInfo?.has_next_page) {
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
      {props.pageInfo?.has_next_page && (
        <ButtonContainer>{renderButton}</ButtonContainer>
      )}
      <DownloadControls
        listCount={
          selectedTab === 'images'
            ? props.imageList.length
            : props.videoList.length
        }
        downloadMode={props.downloadMode}
        handleSelectAll={handleSelectAll}
        handleCloseDownload={handleCloseDownload}
        selectedCount={
          selectedTab === 'images'
            ? props.imageList.filter((img) => img.selected).length
            : props.videoList.filter((vid) => vid.selected).length
        }
        handleDownload={handleDownload}
      />
    </>
  );
};

export default DisplayGrid;
