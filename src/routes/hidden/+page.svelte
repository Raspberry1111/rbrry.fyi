<script lang="ts">
	import Topbar from "$lib/topbar.svelte";
	import { onMount } from "svelte";
	import { page } from "$app/state";

	const ITEM_HEIGHT = 50;
	const TOTAL_ITEMS = 200;
	const FAKE_TOTAL = 1000000000; // very large height

	let altMode = $state(false);
	let names = $derived(
		altMode
			? ["is cool", "is awesome", "is great", "is amazing"]
			: ["sucks", "is a bum", "is not cool", "exists"],
	);

	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	let container: HTMLDivElement;

	let startIndex = $derived(Math.floor(scrollTop / ITEM_HEIGHT));
	let visibleCount = $derived(Math.ceil(viewportHeight / ITEM_HEIGHT) + 5);
	let visibleItems = $derived(
		Array.from({ length: Math.min(visibleCount, 100) }, (_, i) => {
			return {
				index:
					((startIndex + i) % TOTAL_ITEMS) +
					Math.floor(Math.random() * 4),
				absIndex: startIndex + i,
			};
		}),
	);

	onMount(() => {
		viewportHeight = window.innerHeight;

		window.addEventListener("scroll", () => {
			scrollTop = window.scrollY;
		});

		window.addEventListener("resize", () => {
			viewportHeight = window.innerHeight;
		});
	});
</script>

<Topbar
	onHiddenClicked={() => {
		altMode = !altMode;
	}}
/>

<div
	bind:this={container}
	onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
	style="height: {FAKE_TOTAL}px; position: relative;"
>
	{#each visibleItems as i}
		<h1
			class="rainbow infinite-scroll"
			style="top: {i.absIndex * ITEM_HEIGHT}px; height: {ITEM_HEIGHT}px;
				animation-delay: {Math.random() * 0.5}s;

				"
		>
			nic chose {names[i.index % 4]}
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

	.container {
		height: 400vh;
	}

	.infinite-scroll {
		position: absolute;
		width: 100%;
		left: 0;
		right: 0;
	}

	.rainbow {
		background: linear-gradient(
			90deg,
			red,
			yellow,
			green,
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
