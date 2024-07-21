import {z, defineCollection} from "astro:content";

const sharedSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.date(),
  modDate: z.date().optional(),
  tags: z.array(z.string()),
  image: z.string().url(),
  image_alt: z.string(),
});

const blogCollection = defineCollection({
  type: "content",
  schema: sharedSchema,
});

const portfolioCollection = defineCollection({
  type: "content",
  schema: sharedSchema,
});

export const collections = {
  blog: blogCollection,
  portfolio: portfolioCollection,
};
