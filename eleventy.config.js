import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["md"],
  });

  // Set dev server options
  eleventyConfig.setServerOptions({
    port: 8080,
    domDiff: true,
    liveReload: true,
  });

  // Add a filter to format dates
  eleventyConfig.addFilter("formatDate", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Add a collection for blog posts
  eleventyConfig.addCollection("blogPosts", (collection) => {
    return collection.getFilteredByGlob("src/posts/*.md");
  });

  // Add a collection for portfolio items
  eleventyConfig.addCollection("portfolioPosts", (collection) => {
    return collection.getFilteredByGlob("src/portfolio/*.md");
  });

  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    markdownTemplateEngine: "html",
  };
}
