import adapter from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";

const dev = process.env.NODE_ENV === 'development';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csp: {
			mode: "auto",
			directives: {
				"base-uri": ["'none'"],
				"default-src": ["'none'"],
				"img-src": ["'self'", "https:", "data:", "blob:"],
				"media-src": ["'self'", "https:", "data:", "blob:"],
				"connect-src": dev
					? [
						"'self'",
					]
					: undefined
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