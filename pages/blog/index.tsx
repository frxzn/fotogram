import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArticleFields, FullArticle } from '../../interfaces';
import { client } from '../../client';

interface Props {
  articles: FullArticle[];
}

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
    <div>
      <Head>
        <title>Blog | Fotogram</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul>
        {articles.map((article) => (
          <li key={article.sys.id}>
            <Link href={'blog/' + article.fields.slug}>
              <a>{article.fields.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
