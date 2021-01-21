import React from 'react';
import { Image, Video } from '../../interfaces';
import ImageModal from './ImageModal';
import VideoModal from './VideoModal';

interface Props {
  imageList: Image[];
  videoList: Video[];
  selectedTab: string;
  selectedMediaIndex: number;
  setSelectedMediaIndex: React.Dispatch<React.SetStateAction<number>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const DisplayModal: React.FC<Props> = (props) => {
  let render;
  if (props.selectedTab === 'images') {
    render = (
      <ImageModal
        src={props.imageList[props.selectedMediaIndex].src.high}
        mediaCount={props.imageList.length}
        selected={props.selectedMediaIndex}
        setSelected={props.setSelectedMediaIndex}
        setShow={props.setShow}
      />
    );
  } else if (props.selectedTab === 'videos') {
    render = (
      <VideoModal
        src={props.videoList[props.selectedMediaIndex].videoUrl}
        mediaCount={props.videoList.length}
        selected={props.selectedMediaIndex}
        setSelected={props.setSelectedMediaIndex}
        setShow={props.setShow}
      />
    );
  } else {
    render = <></>;
  }
  return render;
};

export default DisplayModal;
