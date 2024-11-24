import { Feed } from "feed";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

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
        .sort(
            ({ published: publishedA }, { published: publishedB }) =>
                new Date(publishedB + "T13:00:00Z").getTime() -
                new Date(publishedA + "T13:00:00Z").getTime(),
        );
};

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
        updated: new Date(`${writings[0].published}T13:00:00Z`),
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
            date: new Date(writing.published + "T13:00:00Z"),
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
