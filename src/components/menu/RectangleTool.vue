<template>
	<a :id="'tool-' + name" class="rectangleTool" @click="$emit('click')">
		<span :class="name" />
	</a>
</template>

<script>
	export default {
		props: ['name'],

		mounted () {},

		data () {
			return {}
		}
	}
</script>

<style>
	a.rectangleTool {
		border: 2px solid black;
		border-radius: 3px;
		width: 20px;
		height: 20px;
	}
	a.rectangleTool span {
		display: inline-flex;
	}
	a.rectangleTool span[class$=Size] {
		position: absolute;
		background-color: black;
		border-radius: 50%;
	}
	a.rectangleTool span.smallSize {
		top: 8px;
		left: 8px;
		height: 4px;
		width: 4px;
	}
	a.rectangleTool span.mediumSize {
		top: 5px;
		left: 5px;
		height: 10px;
		width: 10px;
	}
	a.rectangleTool span.bigSize {
		top: 3px;
		left: 3px;
		height: 14px;
		width: 14px;
	}
	.tool:hover{

	}
</style>