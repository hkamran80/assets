import {
    basePath,
    baseOutputPath,
    moveFolder,
    minifyJSON,
    minifyCSS,
} from "@hkamran/utility-assets";
import { join } from "path";
import { generateFeeds } from "./feed.js";
import { constants, copyFile, readdir } from "fs/promises";

// TODO: Update `@hkamran/utility-assets` to check for output directory
(await readdir(basePath, { withFileTypes: true })).forEach(async (item) => {
    if (item.isFile()) {
        await copyFile(
            join(basePath, item.name),
            join(baseOutputPath, item.name),
            constants.COPYFILE_EXCL,
        );
    } else if (item.isDirectory()) {
        await moveFolder(
            join(basePath, item.name),
            join(baseOutputPath, item.name),
        );
    }
});

await moveFolder(
    join(basePath, "article-graphics"),
    join(baseOutputPath, "article-graphics"),
);
await moveFolder(
    join(basePath, "article-support"),
    join(baseOutputPath, "article-support"),
);
await moveFolder(
    join(basePath, "nebula-new-tab-screenshots"),
    join(baseOutputPath, "nebula-new-tab-screenshots"),
);
await moveFolder(
    join(basePath, "showcase-logos"),
    join(baseOutputPath, "showcase-logos"),
);
await moveFolder(join(basePath, "profile"), join(baseOutputPath, "profile"));
await moveFolder(
    join(basePath, "extra-images"),
    join(baseOutputPath, "extra-images"),
);

await minifyJSON(basePath, baseOutputPath);
await minifyCSS(basePath, baseOutputPath);

await generateFeeds(baseOutputPath);
