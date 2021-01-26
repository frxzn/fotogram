import { GetStaticProps } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import { ArticleFields, FullArticle } from '../../interfaces';
import { client } from '../../client';
import Card from '../../components/Blog/Card';

interface Props {
  articles: FullArticle[];
}

const Main = styled.main`
  color: #444444;
`;

const Header = styled.h1`
  text-align: center;
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
    <>
      <Head>
        <title>Blog | Fotogram</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <Header>Tips and tricks for instagram</Header>
        <List>
          {articles.map((article) => (
            <Card key={article.sys.id} article={article.fields} />
          ))}
        </List>
      </Main>
    </>
  );
};

export default Home;
