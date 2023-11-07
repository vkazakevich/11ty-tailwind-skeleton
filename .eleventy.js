const htmlMin = require("html-minifier");

const tailwind = require("tailwindcss");
const postCss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const postcssFilter = (cssCode, done) => {
  postCss([
    tailwind(require("./tailwind.config")),
    autoprefixer(),
    cssnano({ preset: "default" }),
  ])
    .process(cssCode, {
      from: "./src/_includes/styles/main.css",
    })
    .then(
      (r) => done(null, r.css),
      (e) => done(e, null)
    );
};

module.exports = function (config) {
  config.addCollection("sitemap", (collectionApi) => {
    return collectionApi.getFilteredByGlob(["src/*.njk"]);
  });

  ["src/robots.txt", "src/images"].forEach((path) =>
    config.addPassthroughCopy(path)
  );

  config.addWatchTarget("./src/_includes/styles/main.css");
  config.addNunjucksAsyncFilter("postcss", postcssFilter);

  config.addTransform("htmlmin", function (content) {
    if (this.outputPath && this.outputPath.endsWith(".html")) {
      let minified = htmlMin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  config.addFilter("dateISO", (value) => {
    return value.toISOString().split("T")[0];
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
