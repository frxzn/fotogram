import React from 'react';
import styled from 'styled-components';
import { User, Display } from '../interfaces';
import Grid from './Grid';
import TabNavigation from './TabNavigation';

interface Props {
  user: User | undefined;
  displayList: Display[];
  handleSelect: (index: number) => void;
}

const Container = styled.div``;

const DisplayGrid: React.FC<Props> = (props) => {
  return (
    <Container>
      <TabNavigation />
      <Grid
        user={props.user}
        displayList={props.displayList}
        handleSelect={props.handleSelect}
      />
    </Container>
  );
};

export default DisplayGrid;
