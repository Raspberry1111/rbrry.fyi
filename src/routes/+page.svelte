<script lang="ts">
	import { resolve } from "$app/paths";
	import Topbar from "$lib/topbar.svelte";
</script>

<Topbar />

<div>
	<h1>home</h1>
	<p>Very cool home page</p>
</div>

<style lang="scss">
	h1 {
		text-align: center;
	}
	div {
		padding: 1rem;
	}
</style>
