<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	let { onHiddenClicked = () => {} } = $props();
</script>

<nav class="topbar">
	<a
		href={resolve("/")}
		aria-current={page.url.pathname === "/" ? "page" : undefined}>home</a
	>
	<a
		href={resolve("/gif")}
		aria-current={page.url.pathname === "/gif/" ? "page" : undefined}>gif</a
	>
	<a
		href={resolve("/hidden/")}
		aria-current={page.url.pathname === "/hidden/" ? "page" : undefined}
		onclick={() => onHiddenClicked()}
		class="hidden">hidden</a
	>
</nav>

<style lang="scss">
	a,
	a:visited,
	a:hover,
	a:active,
	a:focus {
		text-decoration: none;
	}

	a {
		display: inline-block;
		padding: 0.5rem 1rem;
		color: $primary-color;
		text-decoration: none;
		cursor: pointer;
	}

	a:hover,
	a:focus {
		scale: 1.05; /* slightly enlarge on hover/focus */
	}

	a[aria-current="page"] {
		color: $active-page-link;
	}

	a.hidden {
		color: $topbar-background-color;
		margin-left: auto;
	}

	a.hidden[aria-current="page"] {
		color: $active-page-link;
	}

	a.hidden:hover,
	a.hidden:focus {
		scale: 1;
	}

	.topbar {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		background-color: $topbar-background-color;
		display: flex;
		align-items: center;
		padding: 0;
		z-index: 1000;
	}
</style>
