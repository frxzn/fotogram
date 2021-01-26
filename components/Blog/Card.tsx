import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { ArticleFields } from '../../interfaces';

interface Props {
  article: ArticleFields;
}

const Container = styled.li`
  background: #fff;
  border-left: 5px solid ${(props) => props.theme.colors.primary};
  border-right: 5px solid #fff;
  margin: 0 auto 4rem;
  padding: 2rem;
  list-style: none;

  a,
  a:visited,
  a:hover,
  a:active {
    color: inherit;
  }

  @media (max-width: 735px) {
    margin: 0 1rem 4rem 1rem;
  }
`;

const Title = styled.h2`
  display: inline-block;
  margin: 0;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const DisplayDate = styled.p`
  color: #777777;
`;

const Button = styled.a`
  display: inline-block;
  background-color: ${(props) => props.theme.colors.primary};
  color: #fff !important;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 4px 12px;

  :hover {
    cursor: pointer;
  }
`;

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${date.getDate()} de ${
    months[date.getMonth()]
  }, ${date.getFullYear()}`;
};

const Card: React.FC<Props> = ({ article }) => {
  return (
    <Container>
      <Link href={'/blog/' + article.slug}>
        <a>
          <Title>{article.title}</Title>
        </a>
      </Link>
      <DisplayDate>{formatDate(article.date)}</DisplayDate>
      <p>{article.preview}</p>
      <Link href={'/blog/' + article.slug}>
        <Button>Explorar</Button>
      </Link>
    </Container>
  );
};

export default Card;
