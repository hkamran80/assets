import { Feed } from "feed";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

/**
 * @typedef {Object} Post A post from the repository
 * @property {string} id The post ID
 * @property {string} title The post title
 * @property {string} description The post description
 * @property {string[]} tags The post tags
 * @property {string} published The post published time
 * @property {string} [updated] The post updated time
 * @property {string} filename The Markdown filename of the post
 * @property {("article"|"note")} type The post type
 * @property {Date} publishedTimestamp The timestamp of when a post was published
 * @property {Date} [updatedTimestamp] The timestamp of when a post was updated
 */

/**
 * Get posts from the repository
 *
 * @returns {Promise<Post[]>} An array of {@link Post} objects
 * */
const getWritings = async () => {
    const contentsFile = await fetch(
        "https://raw.githubusercontent.com/hkamran80/articles/main/markdown/contents.json",
    );
    const contents = await contentsFile.json();

    return [
        ...contents.articles.map((article) => ({
            ...article,
            type: "article",
        })),
        ...contents.notes.map((note) => ({ ...note, type: "note" })),
    ]
        .filter(({ published }) => published !== "")
        .map((post) => ({
            ...post,
            publishedTimestamp: new Date(
                post.published.includes("T")
                    ? post.published
                    : `${post.published}T07:00:00.000-08:00`,
            ),
            updatedTimestamp: post.updated ? new Date(post.updated) : undefined,
        }))
        .sort(
            (
                { publishedTimestamp: publishedA, updatedTimestamp: updatedA },
                { publishedTimestamp: publishedB, updatedTimestamp: updatedB },
            ) =>
                (updatedB ?? publishedB).getTime() -
                (updatedA ?? publishedA).getTime(),
        );
};

/**
 * Build the feed from an array of posts
 *
 * @param {Post[]} writings The posts from the repository
 * @returns {Feed} A feed from the posts
 * */
const buildFeed = (writings) => {
    const feed = new Feed({
        id: "https://hkamran.com",
        title: "H. Kamran",
        description: "Articles and notes by H. Kamran",
        link: "https://hkamran.com",
        language: "en",
        image: "https://hkamran.com/profile.png",
        favicon: "https://hkamran.com/favicon.png",
        copyright: `© ${new Date().getFullYear()} H. Kamran. All rights reserved.`,
        updated: writings[0].updatedTimestamp ?? writings[0].publishedTimestamp,
        feedLinks: {
            rss: "https://assets.hkamran.com/website/feed.rss",
            atom: "https://assets.hkamran.com/website/feed.atom",
            json: "https://assets.hkamran.com/website/feed.json",
        },
        author: {
            name: "H. Kamran",
            link: "https://hkamran,com",
        },
    });

    writings.forEach((writing) => {
        const image =
            writing.type === "article"
                ? `<img src="https://assets.hkamran.com/graphics/article/${writing.id}" alt="Feature photo for ${writing.title}" />`
                : "";

        feed.addItem({
            id: writing.id,
            title: writing.title,
            link: `https://hkamran.com/${writing.type}/${writing.id}`,
            description: `${image}<p>${writing.description}</p><p>The ${writing.type} <a href="https://hkamran.com/${writing.type}/${writing.id}?ref=feed">${writing.title}</a> is available on <a href="https://hkamran.com/?ref=feed">my website</a>.`,
            date: writing.updatedTimestamp ?? writing.publishedTimestamp,
            published: writing.publishedTimestamp,
            image:
                writing.type === "article"
                    ? {
                          url: `https://assets.hkamran.com/graphics/article/${writing.id}`,
                          title: `Feature photo for ${writing.title}`,
                          type: "image/png",
                      }
                    : undefined,
            category: writing.tags.map((tag) => ({ name: tag })),
        });
    });

    return feed;
};

export const generateFeeds = async (outputFolder = ".") => {
    try {
        const writings = await getWritings();
        const feed = buildFeed(writings);

        await mkdir(join(outputFolder, "website"));

        await writeFile(join(outputFolder, "website", "feed.rss"), feed.rss2());
        await writeFile(
            join(outputFolder, "website", "feed.atom"),
            feed.atom1(),
        );

        feed.items = feed.items.map((item) => ({
            ...item,
            image: item.link.includes("article") ? item.image.url : undefined,
        }));
        await writeFile(
            join(outputFolder, "website", "feed.json"),
            feed.json1(),
        );
    } catch (error) {
        console.error(error);
    }
};
