import adapter from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
	},
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ["src"],
			prependData: `@use "lib/styles/variables.scss" as *;`
		},
	}),
};

export default config;
