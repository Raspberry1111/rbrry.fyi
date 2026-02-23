<script lang="ts">
	import Topbar from "$lib/topbar.svelte";

	import Masonry from "svelte-bricks";

	import { onMount } from "svelte";
	import { writable } from "svelte/store";

	type Gif = {
		url: string;
		tags: string[];
		discordUrl?: string;
	};

	const gifsStore = writable<Gif[]>([]);

	let searchInput = $state("");
	let urlInput = $state("");
	let discordURLInput = $state("");
	let tagsInput = $state("");

	// validation flags for inline errors
	let urlError = $state(false);
	let tagsError = $state(false);

	let searchTags = $derived(
		searchInput
			.split(" ")
			.map((tag) => tag.trim())
			.filter((tag) => tag !== ""),
	);

	let gifs = $derived(
		$gifsStore
			.filter((gif) =>
				searchTags.every((tag) =>
					gif.tags.some((gifTag) =>
						gifTag.toLowerCase().includes(tag.toLowerCase()),
					),
				),
			)
			.map((gif, index) => ({ ...gif, id: index })),
	);

	function onAddButtonClick() {
		// set validation flags instead of showing an alert
		urlError = urlInput.trim() === "";
		tagsError = tagsInput.trim() === "";

		if (urlError || tagsError) {
			return;
		}

		let tags = tagsInput
			.split(" ")
			.map((tag) => tag.trim())
			.filter((tag) => tag !== "");

		if (tags.length === 0) {
			return;
		}

		gifsStore.update((currentGifs) => {
			const newGif = {
				url: urlInput.trim(),
				tags: tags,
				discordUrl:
					discordURLInput.trim() === ""
						? urlInput.trim()
						: discordURLInput.trim(),
			};
			return [...currentGifs, newGif];
		});

		urlInput = "";
		tagsInput = "";
		discordURLInput = "";

		// clear validation after successful add
		urlError = false;
		tagsError = false;
	}

	function onExportButtonClicked() {
		const dataStr =
			"data:text/json;charset=utf-8," +
			encodeURIComponent(JSON.stringify($gifsStore));
		const downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", "gifs.json");
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	function mergeGifs(currentGifs: Gif[], importedGifs: Gif[]): Gif[] {
		const merged = [...currentGifs];
		importedGifs.forEach((importedGif) => {
			if (
				!merged.some(
					(gif) =>
						gif.url === importedGif.url &&
						gif.discordUrl === importedGif.discordUrl,
				)
			) {
				merged.push(importedGif);
			}
		});
		return merged;
	}

	function onImportButtonClicked() {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "application/json";
		fileInput.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const importedGifs = JSON.parse(
						event.target?.result as string,
					) as Gif[];
					gifsStore.update((currentGifs) =>
						mergeGifs(currentGifs, importedGifs),
					);
				} catch (err) {
					alert("Failed to import: " + err);
				}
			};
			reader.readAsText(file);
		};
		fileInput.click();
	}

	function isVideo(url: string) {
		const extension = url.split(".").pop()?.toLowerCase();
		return extension
			? ["mp4", "webm", "ogg", "ogv"].includes(extension)
			: false;
	}

	onMount(() => {
		const storedGifs = localStorage.getItem("gifs");
		if (storedGifs) {
			gifsStore.set(JSON.parse(storedGifs));
		}

		gifsStore.subscribe((value) => {
			localStorage.setItem("gifs", JSON.stringify(value));
		});
	});
</script>

<title>GIF Library - rbrry.fyi</title>

<Topbar />

<div id="controls">
	<div id="data-button-container">
		<button id="export-button" onclick={onExportButtonClicked}
			>Export GIFs</button
		>
		<button id="import-button" onclick={onImportButtonClicked}
			>Import GIFs</button
		>
	</div>
	<div id="search">
		<input
			type="text"
			placeholder="Search for a GIF..."
			id="search-input"
			bind:value={searchInput}
		/>
	</div>
	<br />
	<div id="add">
		<input
			type="text"
			placeholder="URL"
			id="add-input"
			bind:value={urlInput}
			class:error={urlError && urlInput.trim() === ""}
		/>
		<input
			type="text"
			placeholder="Discord URL (optional)"
			id="add-discord-url-input"
			bind:value={discordURLInput}
		/>
		<input
			type="text"
			placeholder="Tags (space separated)"
			id="add-tags-input"
			bind:value={tagsInput}
			class:error={tagsError && tagsInput.trim() === ""}
		/>

		<button id="add-button" onclick={onAddButtonClick}>Add</button>
	</div>
</div>

<main id="video-container">
	<Masonry
		items={gifs}
		idKey="id"
		gap={12}
		id="video-container"
		animate={false}
		minColWidth={200}
		maxColWidth={1000}
		order="row-first"
		calcCols={(masonryWidth, minColWidth, gap) => {
			return Math.min(
				gifs.length,
				6,
				Math.floor((masonryWidth + gap) / (minColWidth + gap)) || 1,
			);
		}}
	>
		{#snippet children({ item: gif, idx: index })}
			<div class="gif-container">
				{#key gif.url}
					{#if isVideo(gif.url)}
						<video
							class="gif-video"
							loop
							muted
							playsinline
							disablepictureinpicture
							onmouseenter={(e) => e.currentTarget.play()}
							onmouseleave={(e) => e.currentTarget.pause()}
						>
							<source src={gif.url} />
						</video>
					{:else}
						<img src={gif.url} alt={gif.url} class="gif-video" />
					{/if}
				{/key}
				<p>Tags: {gif.tags.join(", ")}</p>
				<div class="button-wrapper">
					<button
						class="copy-discord-button"
						onclick={() => {
							navigator.clipboard
								.writeText(gif.discordUrl || gif.url)
								.then(() => alert("Discord URL copied!"))
								.catch((err) =>
									alert("Failed to copy: " + err),
								);
						}}
					>
						Copy Discord URL
					</button>
					<button
						class="copy-button"
						onclick={() => {
							navigator.clipboard
								.writeText(gif.url)
								.then(() => alert("URL copied!"))
								.catch((err) =>
									alert("Failed to copy: " + err),
								);
						}}
					>
						Copy URL
					</button>
					<button
						class="close-button"
						onclick={() => {
							if (
								!confirm(
									`Delete this GIF?\nURL: ${gif.url}\nDiscord URL: ${gif.discordUrl}\nTags: ${gif.tags.join(", ")}`,
								)
							)
								return;
							gifsStore.update((currentGifs) =>
								currentGifs.filter((_, i) => i !== index),
							);
						}}
					>
						X
					</button>
				</div>
			</div>
		{/snippet}
	</Masonry>
</main>

<style lang="scss">
	@use "sass:math";
	@use "sass:color";

	$secondary-color: #f5f5f5;
	$accent-color: #ff6b6b;
	$text-color: #333;
	$border-radius: 6px;
	$gap: 12px;
	$button-padding: 12px 24px;
	$gif-button-padding: 6px 12px;

	$shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	$grid-row-gap: 10px;

	$copy-button-color: #4caf50;
	$discord-button-color: #7289da;
	$close-button-color: #e74c3c;
	$data-button-color: #5c76d2;
	$add-button-color: $data-button-color;

	#controls {
		max-width: 800px;
		justify-self: center;
		display: flex;
		flex-direction: column;
		gap: $gap;
		padding: $gap;

		#data-button-container {
			justify-content: center;
			display: flex;
			gap: $gap;

			button {
				padding: $button-padding;
				border-radius: $border-radius;
				border: none;
				background-color: $data-button-color;
				color: white;
				cursor: pointer;
				font-weight: 500;
				transition: background 0.2s;

				&:hover {
					background-color: color.adjust(
						$data-button-color,
						$lightness: -10%,
						$space: hsl
					);
				}
			}
		}

		#search {
			input {
				width: 100%;
				padding: $button-padding;
				border-radius: $border-radius;
				border: 1px solid
					color.adjust($text-color, $lightness: 50%, $space: hsl);
				font-size: 1rem;
				&:focus {
					outline: none;
					border-color: $primary-color;
					box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
				}
			}
		}

		#add {
			display: flex;
			flex-wrap: wrap;
			gap: $gap;

			input {
				flex: 1 1 50px;
				padding: math.div($button-padding, 1.5);
				border-radius: $border-radius;
				border: 1px solid
					color.adjust($text-color, $lightness: 50%, $space: hsl);
				font-size: 1rem;
				text-align: center;
			}

			#add-button {
				padding: $button-padding;
				background-color: $add-button-color;
				color: $primary-color;
				font-weight: 500;
				border-radius: $border-radius;
				border: none;
				cursor: pointer;
				transition: background 0.2s;

				&:hover {
					background-color: color.adjust(
						$accent-color,
						$lightness: -10%,
						$space: hsl
					);
				}
			}
		}
	}

	#video-container {
		padding: $gap;

		.gif-container {
			background: $topbar-background-color;
			border-radius: $border-radius;
			box-shadow: $shadow;
			display: grid;
			grid-auto-rows: auto auto auto; // small row height for masonry
			flex-direction: column;
			position: relative;
			height: 100%;
			justify-content: center;

			.gif-video {
				width: 100%;
				cursor: default;
				border-radius: $border-radius $border-radius 0 0;
			}

			p {
				padding: $gap * 0.5;
				margin: 0;
				font-size: 0.85rem;
				color: $primary-color;
			}

			.button-wrapper {
				margin-top: auto;
				display: flex;
				justify-content: center;
				gap: $gap * 0.5;
				padding: $gap * 0.5;
				flex-wrap: wrap;

				button {
					padding: $gif-button-padding;
					border-radius: $border-radius;
					border: none;
					cursor: pointer;
					font-size: 0.8rem;
					font-weight: 500;
					transition: background 0.2s;

					&.copy-button {
						background: $copy-button-color;
						color: $primary-color;

						&:hover {
							background: color.adjust(
								$copy-button-color,
								$lightness: -10%,
								$space: hsl
							);
						}
					}

					&.copy-discord-button {
						background: $discord-button-color;
						color: $primary-color;

						&:hover {
							background: color.adjust(
								$discord-button-color,
								$lightness: -10%,
								$space: hsl
							);
						}
					}

					&.close-button {
						background: $close-button-color;
						color: $primary-color;

						&:hover {
							background: color.adjust(
								$close-button-color,
								$lightness: -10%,
								$space: hsl
							);
						}
					}
				}
			}
		}
	}

	button:focus {
		outline: none;
	}

	input:focus {
		outline: none;
	}

	input {
		&.error,
		&.error:focus {
			border: 2px solid $close-button-color !important;
			box-shadow: 0 0 0 4px rgba($close-button-color, 0.08);
		}
	}
</style>
