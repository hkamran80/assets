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
const minifyFiles = async (basePath, outputDir = null) => {
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
                !filename.endsWith("toml")
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
 * @param {String} [outputDir] The output directory (optional)
 */
const moveFolder = async (basePath, outputDir = null) => {
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

// Minification
await minifyFiles(basePath, `${baseOutputPath}/`);
