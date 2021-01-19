import React from 'react';
import styled from 'styled-components';
import { User, Image } from '../../interfaces';

interface Props {
  user: User | undefined;
  imageList: Image[];
  handleSelect: (index: number) => void;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 28px;
  margin-bottom: 3rem;

  @media (max-width: 735px) {
    grid-gap: 3px;
    margin-bottom: 3px;
  }
`;

const GridItem = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  ::after {
    content: '';
    padding-bottom: 100%;
    display: block;
  }

  :hover {
    cursor: pointer;
    filter: brightness(calc(2 / 3));
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;

  :hover {
    cursor: pointer;
  }
`;

const ImageGrid: React.FC<Props> = ({ user, imageList, handleSelect }) => {
  return (
    <GridContainer>
      {imageList.map((image) => (
        <GridItem key={image.id} onClick={() => handleSelect(image.index)}>
          <StyledImage src={image.src} alt={`${user?.full_name}'s photo`} />
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default ImageGrid;