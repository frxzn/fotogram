import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Props {
  dropdownButton: string;
  menuItems: string[];
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const Container = styled.div`
  position: relative;
  line-height: 1.5;
`;

const StyledList = styled.ul`
  position: absolute;
  padding: 8px 0;
  min-width: 160px;
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 3px;
  right: 0;
  margin-top: 1rem;
`;

const ListItem = styled.li`
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
  padding: 8px 20px;
  color: #212529;
  cursor: pointer;
  :hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  color: #545454;
  cursor: pointer;
  :hover {
    color: ${(props) => props.theme.colors.primary};
  }

  img {
    width: 8px;
    height: 8px;
    margin-left: 8px;
  }
`;

const Dropdown: React.FC<Props> = ({
  menuItems,
  dropdownButton,
  setSelected,
}) => {
  const [show, setShow] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleClick = (e: any) => {
    if (node && node.current) {
      if (node.current.contains(e.target)) {
        // inside click
        return;
      }
      // outside click
      setShow(false);
    }
  };

  const handleSelect = (item: string) => {
    setSelected(item);
    setShow(false);
  };

  const renderList = menuItems.map((item) => {
    return (
      <ListItem key={item} onClick={() => handleSelect(item)}>
        {item}
      </ListItem>
    );
  });

  return (
    <Container ref={node}>
      <DropdownButton onClick={() => setShow((prev) => !prev)}>
        {dropdownButton}
        <img src="/icons/drop-down-arrow.svg" alt="dropdown arrow" />
      </DropdownButton>
      {show && <StyledList>{renderList}</StyledList>}
    </Container>
  );
};

export default Dropdown;
