import adapter from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"base-uri": ["'none'"],
				"default-src": ["'self'"],
				"img-src": ["'self'", "https:", "data:", "blob:"],
				"media-src": ["'self'", "https:", "data:", "blob:"],
				"style-src": ["'self'", "'unsafe-inline'"],
			}
		},
	},
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ["src"],
			prependData: `@use "lib/styles/variables.scss" as *;`
		},
	}),



};

export default config;