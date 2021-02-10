import axios from 'axios';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ImageModal from './ImageModal';
import VideoModal from './VideoModal';

const DisplayModal: React.FC = () => {
  const images = useSelector((state: RootState) => state.api.images);
  const videos = useSelector((state: RootState) => state.api.videos);
  const selectedMediaIndex = useSelector(
    (state: RootState) => state.userInterface.selectedMediaIndex
  );
  const selectedTab = useSelector(
    (state: RootState) => state.userInterface.selectedTab
  );

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

  let render;
  if (selectedTab === 'images') {
    render = (
      <ImageModal
        src={images[selectedMediaIndex].src}
        id={images[selectedMediaIndex].id}
        prevShortcode={
          selectedMediaIndex > 0
            ? images[selectedMediaIndex - 1].shortcode
            : undefined
        }
        nextShortcode={
          selectedMediaIndex + 1 < images.length
            ? images[selectedMediaIndex + 1].shortcode
            : undefined
        }
        mediaCount={images.length}
        selectedIndex={selectedMediaIndex}
        handleDownload={handleDownload}
      />
    );
  } else if (selectedTab === 'videos') {
    render = (
      <VideoModal
        src={videos[selectedMediaIndex].src}
        id={videos[selectedMediaIndex].id}
        prevShortcode={
          selectedMediaIndex > 0
            ? videos[selectedMediaIndex - 1].shortcode
            : undefined
        }
        nextShortcode={
          selectedMediaIndex + 1 < videos.length
            ? videos[selectedMediaIndex + 1].shortcode
            : undefined
        }
        mediaCount={videos.length}
        selectedIndex={selectedMediaIndex}
        handleDownload={handleDownload}
      />
    );
  } else {
    render = <></>;
  }
  return render;
};

export default DisplayModal;
