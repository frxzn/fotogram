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

  let render;
  if (selectedTab === 'images') {
    render = (
      <ImageModal
        src={images[selectedMediaIndex].src.high}
        id={images[selectedMediaIndex].id}
        mediaCount={images.length}
        selectedIndex={selectedMediaIndex}
      />
    );
  } else if (selectedTab === 'videos') {
    render = (
      <VideoModal
        src={videos[selectedMediaIndex].videoUrl}
        id={videos[selectedMediaIndex].id}
        mediaCount={videos.length}
        selectedIndex={selectedMediaIndex}
      />
    );
  } else {
    render = <></>;
  }
  return render;
};

export default DisplayModal;
