import React from 'react';
import { useAppDispatch } from '../store';
import { setSelectedTab } from '../slices/UserInterfaceSlice';
import styled from 'styled-components';

interface Props {
  selectedTab: string;
  handleCloseDownload: () => void;
}

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid #dbdbdb;

  .active {
    border-top: 1px solid #262626;
    margin-top: -1px;
    color: #262626;
  }
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2rem;
  height: 52px;
  color: #8e8e8e;

  :hover {
    cursor: pointer;
  }

  @media (max-width: 735px) {
    flex: 1;
    height: 42px;
    margin: 0;
  }
`;

interface Item {
  key: 'images' | 'videos';
  name: string;
}

const tabs: Item[] = [
  { key: 'images', name: 'Fotos' },
  { key: 'videos', name: 'Videos' },
];

const TabNavigation: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();

  const handleTabNavigation = (key: 'images' | 'videos') => {
    props.handleCloseDownload();
    dispatch(setSelectedTab(key));
  };

  const render = tabs.map((item) => {
    return (
      <Tab
        className={props.selectedTab === item.key ? 'active' : ''}
        key={item.key}
        onClick={() => handleTabNavigation(item.key)}
      >
        {item.name}
      </Tab>
    );
  });

  return <TabContainer>{render}</TabContainer>;
};

export default TabNavigation;
