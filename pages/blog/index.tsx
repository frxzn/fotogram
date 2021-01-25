import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import { ArticleFields, FullArticle } from '../../interfaces';
import { client } from '../../client';
import Card from '../../components/Blog/Card';

interface Props {
  articles: FullArticle[];
}

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
      <main>
        <List>
          <Card />
          <Card />
          <Card />
          {/* {articles.map((article) => (
            <li key={article.sys.id}>
              <Link href={'blog/' + article.fields.slug}>
                <a>{article.fields.title}</a>
              </Link>
            </li>
          ))} */}
        </List>
      </main>
    </>
  );
};

export default Home;
