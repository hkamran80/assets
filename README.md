# Assets

This repository is home to my assets, including [graphics for my websites](article-graphics/),
[JSON changelogs](nebula-changelog.json), [styles](markdown-styling.css), and files
like [my showcase](creations.json).

## Deployment

This repository is deployed via [Netlify](https://netlify.com). The [build script](lib/build.js)
moves all non-excluded files and folders, as well as minifying the JSON and CSS
files it encounters. Some files are excluded from the minification, namely those
with a `.` or `_` prefix, [schema files](userscripts.schema.json), or the
[`package.json` file](package.json).

The [`_redirects` file](_redirects) has routes configured for all the paths that
are easy to remember/use. The `_headers` file uses these to apply headers.

The [`_headers` file](_headers) has headers for each route (with wildcard suffixes),
specifically `Access-Control-Access-Origin`, `X-XSS-Protection`, `X-Frame-Options`,
and `Content-Type`. `Content-Type` is the only one that changes depending on the
route.
