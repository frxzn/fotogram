import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Image, Video } from '../../interfaces';
import ImageModal from './ImageModal';
import VideoModal from './VideoModal';

interface Props {
  imageList: Image[];
  videoList: Video[];
}

const DisplayModal: React.FC<Props> = (props) => {
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
        src={props.imageList[selectedMediaIndex].src.high}
        mediaCount={props.imageList.length}
        selectedIndex={selectedMediaIndex}
      />
    );
  } else if (selectedTab === 'videos') {
    render = (
      <VideoModal
        src={props.videoList[selectedMediaIndex].videoUrl}
        mediaCount={props.videoList.length}
        selectedIndex={selectedMediaIndex}
      />
    );
  } else {
    render = <></>;
  }
  return render;
};

export default DisplayModal;
