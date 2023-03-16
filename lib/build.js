import {
    basePath,
    baseOutputPath,
    moveFiles,
    moveFolder,
    minifyJSON,
    minifyCSS,
} from "@hkamran/utility-assets";
import { join } from "path";

await moveFiles(basePath, baseOutputPath);

await moveFolder(
    join(basePath, "article-graphics"),
    join(baseOutputPath, "article-graphics")
);
await moveFolder(
    join(basePath, "nebula-new-tab-screenshots"),
    join(baseOutputPath, "nebula-new-tab-screenshots")
);
await moveFolder(
    join(basePath, "showcase-logos"),
    join(baseOutputPath, "showcase-logos")
);
await moveFolder(join(basePath, "profile"), join(baseOutputPath, "profile"));

await minifyJSON(basePath, baseOutputPath);
await minifyCSS(basePath, baseOutputPath);
