import { SitemapStream, streamToPromise } from 'sitemap';
import { client } from '../../client';
import { ArticleFields } from '../../interfaces';

export default async (req: any, res: any) => {
  try {
    const smStream = new SitemapStream({
      hostname: `https://${req.headers.host}`,
    });

    // Add landing and blog
    smStream.write({
      url: `/`,
    });

    smStream.write({
      url: `/blog`,
    });

    // List of posts
    const data = await client.getEntries<ArticleFields>({
      content_type: 'article',
    });

    // Create each URL row
    data.items.forEach((item) => {
      smStream.write({
        url: `/blog/${item.fields.slug}`,
      });
    });

    // End sitemap stream
    smStream.end();

    // XML sitemap string
    const sitemapOutput = (await streamToPromise(smStream)).toString();

    // Change headers
    res.writeHead(200, {
      'Content-Type': 'application/xml',
    });

    // Display output to user
    res.end(sitemapOutput);
  } catch (e) {
    console.log(e);
    res.send(JSON.stringify(e));
  }
};
