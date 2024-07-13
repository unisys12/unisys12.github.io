import { defineConfig } from 'astro/config';
import { transformerNotationHighlight, transformerNotationWordHighlight, transformerNotationDiff } from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
    site: 'https://unisys12.github.io',
    markdown: {
        shikiConfig: {
            theme: 'material-theme-darker',
            transformers: [
                transformerNotationHighlight(), 
                transformerNotationWordHighlight(), 
                transformerNotationDiff()
            ],
        }
    }
});
