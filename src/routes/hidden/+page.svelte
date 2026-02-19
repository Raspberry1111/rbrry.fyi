<script lang="ts">
	import Topbar from "$lib/topbar.svelte";
	import { onMount } from "svelte";

	const FAKE_TOTAL = 100_000; // very large height

	let altMode = $state(false);
	let names = $derived(
		altMode
			? ["is cool", "is awesome", "is great", "is amazing"]
			: ["sucks", "is a bum", "is not cool", "exists"],
	);

	const JUMP_POINT = 10000;
	const TARGET = 1000;

	onMount(() => {
		window.addEventListener("scroll", () => {
			if (window.scrollY > JUMP_POINT) {
				window.scrollTo(0, TARGET);
			}
		});
	});
</script>

<Topbar
	onHiddenClicked={() => {
		altMode = !altMode;
	}}
/>

<div style="height: {FAKE_TOTAL}px;">
	{#each Array(1000) as _, i}
		<h1
			class="rainbow"
			style="animation-delay: {Math.random() * 0.5}s;"
		>
			nic chose {names[i % 4]}
		</h1>
	{/each}
</div>

<style lang="scss">
	h1 {
		text-align: center;
	}
	div {
		padding: 1rem;
	}

	.rainbow {
		background: linear-gradient(
			90deg,
			red,
			yellow,
			rgb(124, 249, 124),
			cyan,
			blue,
			magenta
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: spin 3s linear infinite;
	}

	@keyframes spin {
		to {
			filter: hue-rotate(360deg);
		}
	}
</style>
