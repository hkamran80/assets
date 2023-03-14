import {
    basePath,
    baseOutputPath,
    moveFiles,
    moveFolder,
    minifyJSON,
    minifyCSS,
} from "@hkamran/utility-assets";

await moveFiles(basePath, baseOutputPath);
await moveFolder(
    `${basePath}/article-graphics`,
    `${baseOutputPath}/article-graphics`
);
await moveFolder(
    `${basePath}/nebula-new-tab-screenshots`,
    `${baseOutputPath}/nebula-new-tab-screenshots`
);
await moveFolder(
    `${basePath}/showcase-logos`,
    `${baseOutputPath}/showcase-logos`
);

await minifyJSON(basePath, baseOutputPath);
await minifyCSS(basePath, baseOutputPath);
