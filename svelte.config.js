import adapter from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			//   base: process.env.NODE_ENV === "production" ? "/" : "",
			base: ""
		},
	},
	preprocess: sveltePreprocess({
		scss: {
			includePaths: ["src"],
		},
	}),
};

export default config;
