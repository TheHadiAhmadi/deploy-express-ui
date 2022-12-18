import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";
import ifPreprocess from "@ubeac/svelte/preprocessors/if";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), ifPreprocess()],

  kit: {
    adapter: adapter(),
  },
};

export default config;
