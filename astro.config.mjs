import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://unisys12.github.io',
    markdown: {
        shikiConfig: {
            theme: 'material-theme-darker',
            transformers: [],
        }
    }
});
