import React from 'react';
import styled from 'styled-components';

interface Props {
  downloadMode: boolean;
}

const Fab = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
`;

const BottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 54px;
  z-index: 200;
  background-color: #fff;
  border-top: 1px solid #dbdbdb;
`;

const DownloadControls: React.FC<Props> = ({ downloadMode }) => {
  let render;

  if (downloadMode) {
    render = <BottomNav>ASd</BottomNav>;
  } else {
    render = <Fab>FAB</Fab>;
  }
  return render;
};

export default DownloadControls;
