import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { ArticleFields, FullArticle } from '../../interfaces';
import { client } from '../../client';
import Layout from '../../components/Blog/Layout';

interface Props {
  article: FullArticle;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await client.getEntries<ArticleFields>({
    content_type: 'article',
  });

  return {
    paths: data.items.map((item) => ({ params: { slug: item.fields.slug } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const data = await client.getEntries<ArticleFields>({
    content_type: 'article',
    'fields.slug': params?.slug,
  });

  return {
    props: {
      article: data.items.length ? data.items[0] : null,
    },
    revalidate: 1,
  };
};

const Article: React.FC<Props> = ({ article }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div></div>;
  }

  if (!article) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <Layout title={`${article.fields.title} | Fotogram`}>
      <div style={{ flex: 1 }}>
        <h1>{article.fields.title}</h1>
        <div>
          {documentToReactComponents(article.fields.content, {
            renderNode: {
              [BLOCKS.EMBEDDED_ASSET]: (node) => (
                <Image
                  src={'https:' + node.data.target.fields.file.url}
                  width={node.data.target.fields.file.details.image.width}
                  height={node.data.target.fields.file.details.image.height}
                />
              ),
            },
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Article;
