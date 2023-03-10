import {
    constants,
    copyFile,
    mkdir,
    readdir,
    readFile,
    writeFile,
} from "fs/promises";

/**
 * Minify all JSON files
 * @param {String} basePath The base path to use
 * @param {String} [outputDir] The output directory (optional)
 */
const minifyJSON = async (basePath, outputDir = null) => {
    const files = (await readdir(basePath)).filter(
        (filename) =>
            !filename.startsWith(".") &&
            !filename.startsWith("_") &&
            !filename.includes("schema") &&
            filename.endsWith("json") &&
            filename !== "package.json"
    );

    files.forEach(
        async (filename) =>
            await writeFile(
                `${outputDir || basePath}/${filename}`,
                JSON.stringify(
                    JSON.parse(await readFile(`${basePath}/${filename}`))
                )
            )
    );
};

/**
 * Minify all CSS files
 *
 * Minification code courtesy of [@derder56 on Dev.to](https://dev.to/derder56/how-to-build-a-css-minifier-with-8-lines-of-javascript-4bj3)
 *
 * @param {String} basePath The base path to use
 * @param {String} [outputDir] The output directory (optional)
 */
const minifyCSS = async (basePath, outputDir = null) => {
    const files = (await readdir(basePath)).filter(
        (filename) =>
            !filename.startsWith(".") &&
            !filename.startsWith("_") &&
            !filename.includes("schema") &&
            filename.endsWith("css") &&
            filename !== "package.json"
    );

    files.forEach(
        async (filename) =>
            await writeFile(
                `${outputDir || basePath}/${filename}`,
                await (
                    await readFile(`${basePath}/${filename}`)
                )
                    .toString()
                    .replace(/([^0-9a-zA-Z\.#])\s+/g, "$1")
                    .replace(/\s([^0-9a-zA-Z\.#]+)/g, "$1")
                    .replace(/;}/g, "}")
                    .replace(/\/\*.*?\*\//g, "")
            )
    );
};

/**
 * Move non-JSON files
 * @param {String} basePath The base path to use
 * @param {String} [outputDir] The output directory (optional)
 */
const moveNonJsonFiles = async (basePath, outputDir = null) => {
    (await readdir(`${basePath}`, { withFileTypes: true }))
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name)
        .filter(
            (filename) =>
                !filename.startsWith(".") &&
                !filename.includes("schema") &&
                !filename.endsWith("json") &&
                !filename.endsWith("css") &&
                !filename.endsWith("toml") &&
                !filename.endsWith("md")
        )
        .forEach(
            async (filename) =>
                await copyFile(
                    `${basePath}/${filename}`,
                    `${outputDir || basePath}/${filename}`,
                    constants.COPYFILE_EXCL
                )
        );
};

/**
 * Move a folder and its file
 * @param {String} basePath The base path to use
 * @param {String} outputDir The output directory (optional)
 */
const moveFolder = async (basePath, outputDir) => {
    await mkdir(`${outputDir}`);
    (await readdir(`${basePath}`)).forEach(
        async (filename) =>
            await copyFile(
                `${basePath}/${filename}`,
                `${outputDir}/${filename}`,
                constants.COPYFILE_EXCL
            )
    );
};

const basePath = new URL(import.meta.url).pathname
    .split("/")
    .slice(0, -1)
    .join("/")
    .replace("/lib", "/");

const baseOutputPath = `${basePath}/dist`;

await mkdir(`${baseOutputPath}`);

// Move non-JSON
await moveNonJsonFiles(basePath, `${baseOutputPath}/`);
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

// Minification
await minifyJSON(basePath, `${baseOutputPath}/`);
await minifyCSS(basePath, `${baseOutputPath}/`);
