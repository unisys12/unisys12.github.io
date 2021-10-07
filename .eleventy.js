module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(["md", "njk"]);

  eleventyConfig.addPassthroughCopy("./src/assets/css/styles.css");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
