import React from 'react';
import styled from 'styled-components';

interface Props {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
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

const TabNavigation: React.FC<Props> = (props) => {
  const render = [
    { key: 'images', name: 'Fotos' },
    { key: 'videos', name: 'Videos' },
  ].map((item) => {
    return (
      <Tab
        className={props.selectedTab === item.key ? 'active' : ''}
        key={item.key}
        onClick={() => props.setSelectedTab(item.key)}
      >
        {item.name}
      </Tab>
    );
  });

  return <TabContainer>{render}</TabContainer>;
};

export default TabNavigation;
