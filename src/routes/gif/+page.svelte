<script lang="ts">
	import Topbar from "$lib/topbar.svelte";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";

	type Gif = {
		url: string;
		tags: string[];
		discordUrl?: string;
	};

	const gifsStore = writable<Gif[]>([]);

	let searchInput = $state("");
	let urlInput = "";
	let discordURLInput = "";
	let tagsInput = "";
	let videoContainer: HTMLElement;
	let observer: ResizeObserver;

	let searchTags = $derived(
		searchInput
			.split(" ")
			.map((tag) => tag.trim())
			.filter((tag) => tag !== ""),
	);

	let gifs = $derived(
		$gifsStore.filter((gif) =>
			searchTags.every((tag) =>
				gif.tags.some((gifTag) =>
					gifTag.toLowerCase().includes(tag.toLowerCase()),
				),
			),
		),
	);

	// function reloadGifs(gifs, tags) {
	// 	videoContainer.innerHTML = ""; // clear previous content
	// 	gifsStore.forEach((gif, i) => {
	// 		if (
	// 			tags.length > 0 &&
	// 			!tags.every((searchTag) =>
	// 				gif.tags.some((gifTag) =>
	// 					gifTag.toLowerCase().includes(searchTag.toLowerCase()),
	// 				),
	// 			)
	// 		)
	// 			return;

	// 		const container = document.createElement("div");
	// 		container.classList.add("gif-container");
	// 		container.dataset.id = i.toString();
	// 		container.dataset.discordUrl = gif.discordUrl || gif.url;
	// 		container.dataset.url = gif.url;

	// 		// Video element
	// 		const video = document.createElement("video");
	// 		video.classList.add("gif-video");
	// 		video.loop = true;
	// 		video.muted = true;
	// 		video.playsInline = true;
	// 		video.disablePictureInPicture = true;
	// 		video.addEventListener("mouseenter", () => video.play());
	// 		video.addEventListener("mouseleave", () => video.pause());

	// 		const source = document.createElement("source");
	// 		source.src = gif.url;
	// 		source.type = "video/mp4";
	// 		video.appendChild(source);

	// 		// Close button
	// 		const closeButton = document.createElement("button");
	// 		closeButton.classList.add("close-button");
	// 		closeButton.textContent = "X";
	// 		closeButton.addEventListener("click", () => {
	// 			if (
	// 				!confirm(
	// 					`Delete this GIF?\nURL: ${gif.url}\nDiscord URL: ${container.dataset.discordUrl}\nTags: ${gif.tags.join(", ")}`,
	// 				)
	// 			)
	// 				return;
	// 			gifs.splice(container.dataset.id, 1);
	// 			localStorage.setItem("gifs", JSON.stringify(gifs));
	// 			reloadGifs();
	// 		});

	// 		// Tags
	// 		const tagsText = document.createElement("p");
	// 		tagsText.textContent = "Tags: " + gif.tags.join(", ");

	// 		// Copy buttons
	// 		const copyDiscordButton = document.createElement("button");
	// 		copyDiscordButton.classList.add("copy-discord-button");
	// 		copyDiscordButton.textContent = "Copy Discord URL";
	// 		copyDiscordButton.addEventListener("click", () => {
	// 			navigator.clipboard
	// 				.writeText(container.dataset.discordUrl)
	// 				.then(() => alert("Discord URL copied!"))
	// 				.catch((err) => alert("Failed to copy: " + err));
	// 		});

	// 		const copyUrlButton = document.createElement("button");
	// 		copyUrlButton.classList.add("copy-button");
	// 		copyUrlButton.textContent = "Copy URL";
	// 		copyUrlButton.addEventListener("click", () => {
	// 			navigator.clipboard
	// 				.writeText(container.dataset.url)
	// 				.then(() => alert("URL copied!"))
	// 				.catch((err) => alert("Failed to copy: " + err));
	// 		});

	// 		// Button wrapper
	// 		const buttonWrapper = document.createElement("div");
	// 		buttonWrapper.classList.add("button-wrapper");
	// 		buttonWrapper.appendChild(copyDiscordButton);
	// 		buttonWrapper.appendChild(copyUrlButton);
	// 		buttonWrapper.appendChild(closeButton);

	// 		// Append all elements
	// 		container.appendChild(video);
	// 		container.appendChild(tagsText);
	// 		container.appendChild(buttonWrapper);
	// 		videoContainer.appendChild(container);

	// 		// Masonry row span calculation

	function onAddButtonClick() {
		if (urlInput.trim() === "" || tagsInput.trim() === "") {
			alert("Please enter both URL and tags.");
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

	function resizeMasonryItem(container: HTMLElement) {
		const styles = window.getComputedStyle(videoContainer);
		const rowHeight = parseInt(styles.getPropertyValue("grid-auto-rows"));
		const rowGap = parseInt(styles.getPropertyValue("gap"));

		const video = container.querySelector("video");
		if (!video) return;

		const videoHeight = video.offsetHeight;
		const tagsHeight = container.querySelector("p")
			? (container.querySelector("p") as HTMLElement).offsetHeight
			: 0;

		const buttonsHeight = container.querySelector(".button-wrapper")
			? (container.querySelector(".button-wrapper") as HTMLElement)
					.offsetHeight
			: 0;

		const totalHeight = videoHeight + tagsHeight + buttonsHeight + 10;

		const rowSpan = Math.ceil(
			(totalHeight + rowGap) / (rowHeight + rowGap),
		);

		container.style.gridRowEnd = `span ${rowSpan}`;
	}

	function masonry(node: HTMLElement) {
		observer.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			},
		};
	}

	onMount(() => {
		observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				resizeMasonryItem(entry.target as HTMLElement);
			}
		});

		const storedGifs = localStorage.getItem("gifs");
		if (storedGifs) {
			gifsStore.set(JSON.parse(storedGifs));
		}

		gifsStore.subscribe((value) => {
			localStorage.setItem("gifs", JSON.stringify(value));
		});

		return () => {
			observer.disconnect();
		};
	});
</script>

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
		/>

		<button id="add-button" onclick={onAddButtonClick}>Add</button>
	</div>
</div>

<div id="video-container" bind:this={videoContainer}>
	{#each gifs as gif, index}
		<div class="gif-container">
			{#key gif.url}
				<video
					class="gif-video"
					loop
					muted
					playsinline
					disablepictureinpicture
					onmouseenter={(e) => e.currentTarget.play()}
					onmouseleave={(e) => e.currentTarget.pause()}
					onloadedmetadata={(e) => {
						resizeMasonryItem(
							e.currentTarget.parentElement as HTMLElement,
						);
					}}
					use:masonry
				>
					<source src={gif.url} type="video/mp4" />
				</video>
			{/key}
			<p>Tags: {gif.tags.join(", ")}</p>
			<div class="button-wrapper">
				<button
					class="copy-discord-button"
					onclick={() => {
						navigator.clipboard
							.writeText(gif.discordUrl || gif.url)
							.then(() => alert("Discord URL copied!"))
							.catch((err) => alert("Failed to copy: " + err));
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
							.catch((err) => alert("Failed to copy: " + err));
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
	{/each}
</div>

<style lang="scss">
	/* Center the controls */
	#controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 20px 0;
		gap: 15px;
	}

	/* Make input sections inline on wide screens */
	#search,
	#add {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		width: 100%;
		max-width: 700px;
	}

	#controls input {
		padding: 8px 10px;
		border-radius: 5px;
		border: 1px solid #ccc;
		font-size: 14px;
		flex: 1 1 120px;
		min-width: 100px;
	}

	/* Buttons inside controls */
	#controls button {
		padding: 8px 14px;
		border-radius: 5px;
		border: none;
		background-color: #5865f2;
		color: white;
		cursor: pointer;
		font-size: 14px;
		flex: 0 0 auto;
		transition:
			padding 0.2s ease,
			font-size 0.2s ease,
			background-color 0.2s ease;
	}

	#controls button:hover {
		background-color: #4752c4;
	}

	/* GIF grid */
	#video-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		grid-auto-rows: 10px; /* small base row height for masonry */
		gap: 15px;
		padding: 20px;
		max-width: 1600px;
		margin: 0 auto;
	}

	/* GIF container */
	.gif-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: $topbar-background-color;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		transition: box-shadow 0.2s ease;
	}

	.gif-container:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); /* subtle "grow" effect via shadow */
	}

	/* Videos */
	.gif-video {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 5px;
	}

	/* Button wrapper */
	.button-wrapper {
		position: static;
		display: flex;
		gap: 5px;
		margin-top: 5px;
		justify-content: center;
		pointer-events: auto;
		padding: 5px;
		transition: all 0.2s ease;
	}

	/* Buttons inside wrapper */
	.button-wrapper button {
		padding: 4px 8px;
		font-size: 12px;
		border-radius: 5px;
		border: none;
		cursor: pointer;
		color: white;
		opacity: 1;
		transition:
			padding 0.2s ease,
			font-size 0.2s ease,
			opacity 0.2s ease,
			background-color 0.2s ease;
	}

	/* Discord copy button */
	.button-wrapper button.copy-discord-button {
		background-color: rgba(45, 129, 232, 0.9);
	}

	.button-wrapper button.copy-discord-button:hover {
		background-color: rgba(45, 129, 232, 0.6);
	}

	.button-wrapper button.copy-button {
		background-color: rgba(67, 181, 129, 0.9);
	}

	.button-wrapper button.copy-button:hover {
		background-color: rgba(67, 181, 129, 0.6);
	}
	

	/* Button hover effect: grows by changing padding/font-size */
	.button-wrapper button:hover {
		opacity: 1;
	}

	/* Close button */
	.button-wrapper .close-button {
		background-color: rgba(255, 0, 0, 0.8);
		color: white;
		width: auto;
		height: auto;
		padding: 4px 8px;
		border-radius: 5px;
		font-weight: normal;
		line-height: normal;
		cursor: pointer;
		border: none;
		transition:
			padding 0.2s ease,
			font-size 0.2s ease,
			background-color 0.2s ease;
	}

	.close-button:hover {
		background-color: rgba(255, 0, 0, 0.6);
	}

	/* Tags text */
	.gif-container p {
		margin: 5px 0 5px 0;
		font-size: 12px;
		color: white;
		text-align: center;
	}

	/* Responsive adjustments */
	@media (max-width: 500px) {
		#controls input {
			flex: 1 1 100%;
		}

		#controls button {
			flex: 1 1 100%;
		}

		.button-wrapper {
			right: 35px;
		}
	}

	/* Data button container */
	#data-button-container {
		display: flex;
		width: 100%;
		margin-left: 35px;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	#export-button,
	#import-button {
		padding: 4px 8px;
		font-size: 12px;
		border-radius: 5px;
		border: none;
		cursor: pointer;
		color: white;
		opacity: 1;
		transition:
			padding 0.2s ease,
			font-size 0.2s ease,
			opacity 0.2s ease;
		z-index: 100;
	}

	#export-button {
		margin-right: 1rem;
	}

	@media (min-width: 1200px) {
		#video-container {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			max-width: 1600px;
		}
	}
</style>
