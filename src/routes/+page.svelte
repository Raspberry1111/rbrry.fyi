<script lang="ts">
	import { resolve } from "$app/paths";
	import Topbar from "$lib/topbar.svelte";
	import { onMount } from "svelte";

	const quotes = [
		{ text: "Say something wise and your name will live forever", author: "Anonymous" },
		{ text: "I’d agree with you but then we’d both be wrong", author: "Socrates" },
		{ text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
		{ text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
	];


	let quote = quotes[Math.floor(Math.random() * quotes.length)];
</script>

<title>Home - rbrry.fyi</title>

<Topbar />

<div>
	<h1>home</h1>
	<p>Very cool home page</p>

	<div class="footer-quote">
		<q>{quote.text}</q> - <cite>{quote.author}</cite>
	</div>
</div>

<style lang="scss">
	h1 {
		text-align: center;
	}
	div {
		padding: 1rem;
	}

	.footer-quote {
		position: fixed;
		bottom: 0.8rem;
		right: 0;
		left: 0;
		text-align: center;
		font-size: 1rem;
		margin-top: 2rem;
		align-self: bottom;
		color: #666;
	}
</style>
