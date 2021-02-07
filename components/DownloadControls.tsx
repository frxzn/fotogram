import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { setDownloadMode } from '../slices/UserInterfaceSlice';

interface Props {
  handleSelectAll: () => void;
  handleCloseDownload: () => void;
  handleDownload: () => void;
  selectedCount: number;
  listCount: number;
}

const BottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.theme.dimensions.barHeight};
  z-index: 200;
  background-color: #fff;
  border-top: 1px solid #dbdbdb;
`;

const Center = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
`;

const Fab = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  border-radius: 50%;
  background-color: #fff;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-box-shadow: 0px 0px 20px -10px #080808;
  box-shadow: 0px 0px 20px -10px #080808;

  :hover {
    cursor: pointer;
  }
`;

const Icon = styled.img`
  height: 1.5rem;
  width: 1.5rem;
`;

const NavIcon = styled.img`
  height: 100%;
  width: 2rem;

  :hover {
    cursor: pointer;
  }
`;

const Button = styled.div`
  color: #fff;
  background-color: #ff0078;
  font-weight: bold;
  padding: 6px 16px;
  border-radius: 3px;

  :hover {
    cursor: pointer;
  }
`;

const DownloadControls: React.FC<Props> = ({
  handleSelectAll,
  handleCloseDownload,
  selectedCount,
  handleDownload,
  listCount,
}) => {
  const dispatch = useAppDispatch();

  const downloadMode = useSelector(
    (state: RootState) => state.userInterface.downloadMode
  );

  let render = <></>;
  if (downloadMode) {
    render = (
      <BottomNav>
        <Center>
          <NavIcon
            src="/icons/check.svg"
            alt="check all icon"
            onClick={handleSelectAll}
          />
          <Button onClick={handleDownload}>Descargar {selectedCount}</Button>
          <NavIcon
            src="/icons/close1.svg"
            alt="close icon"
            onClick={handleCloseDownload}
          />
        </Center>
      </BottomNav>
    );
  } else {
    if (listCount) {
      render = (
        <Fab onClick={() => dispatch(setDownloadMode(true))}>
          <Icon src="/icons/download1.svg" alt="download icon" />
        </Fab>
      );
    }
  }
  return render;
};

export default DownloadControls;
