<template>
	<a :id="'tool-' + name" class="borderedTool tool" @click="$emit('click')">
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
	a.borderedTool {
		border: 2px solid black;
		border-radius: 3px;
		width: 24px;
		height: 24px;
	}
	a.borderedTool span {
		display: inline-flex;
	}
	a.borderedTool span[class$=Size] {
		position: absolute;
		background-color: black;
		border-radius: 50%;
	}
	a.borderedTool span.smallSize {
		top: 8px;
		left: 8px;
		height: 4px;
		width: 4px;
	}
	a.borderedTool span.mediumSize {
		top: 5px;
		left: 5px;
		height: 10px;
		width: 10px;
	}
	a.borderedTool span.bigSize {
		top: 3px;
		left: 3px;
		height: 14px;
		width: 14px;
	}
	#tool-pencil svg {
		margin-top: 2px;
	}
	#tool-eraser svg {
		margin-top: 4px;
	}
	#tool-text svg {
		margin-top: 6px;
	}
	#tool-line svg {
		margin-top: 4px;
	}
	#tool-rectangle svg {
		margin-top: 5px;
	}
	#tool-ellipse svg {
		margin-top: 4px;
	}
	#tool-polygon svg {
		margin-top: 2px;
	}
	#tool-eyedropper svg {
		margin-top: 3px;
	}
	#tool-pan svg {
		margin-top: 4px;
	}
</style>