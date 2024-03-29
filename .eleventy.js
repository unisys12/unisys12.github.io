const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(["md", "njk"]);

  eleventyConfig.addPassthroughCopy("./src/assets/css/styles.css");

  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["*"],
    trim: true,
    lineSeparator: "\n",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
