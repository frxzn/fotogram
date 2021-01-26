import { GetStaticProps } from 'next';
import styled from 'styled-components';
import { ArticleFields, FullArticle } from '../../interfaces';
import { client } from '../../client';
import Layout from '../../components/Blog/Layout';
import Card from '../../components/Blog/Card';

interface Props {
  articles: FullArticle[];
}

const Main = styled.main`
  margin: 0 1rem;
  color: #444444;
  flex: 1;
`;

const Header = styled.h1`
  text-align: center;
  margin: 4rem 0;
  font-weight: 300;

  @media (max-width: 735px) {
    font-size: 1.4rem;
    margin: 2rem 0;
  }
`;

const List = styled.ul`
  padding: 0;
  margin: 0 auto;
  max-width: ${(props) => props.theme.dimensions.maxWidth};
`;

export const getStaticProps: GetStaticProps = async () => {
  const data = await client.getEntries<ArticleFields>({
    content_type: 'article',
  });

  return {
    props: {
      articles: data.items,
    },
    revalidate: 1,
  };
};

const Home: React.FC<Props> = ({ articles }) => {
  return (
    <Layout title={'Blog | Fotogram'}>
      <Main>
        <Header>
          <span style={{ fontWeight: 600 }}>Fotogram blog</span>
          <br />
          Tips and tricks for Instagram
        </Header>
        <List>
          {articles.map((article) => (
            <Card key={article.sys.id} article={article.fields} />
          ))}
        </List>
      </Main>
    </Layout>
  );
};

export default Home;
