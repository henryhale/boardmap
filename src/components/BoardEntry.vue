<script setup lang="ts">
defineProps([
	"isBlackSquare",
	"isSelected",
	"isPossibleMove",
	"showHeatmap",
	"heatValue",
	"heatmapColor",
])
</script>

<template>
	<div
		:class="[
			'aspect-square cursor-pointer relative border border-gray-300',
			isBlackSquare ? 'bg-zinc-300' : 'bg-white',
			isSelected ? 'ring-2 ring-amber-500 ring-offset-2' : '',
			isPossibleMove ? 'ring-2 ring-green-500 ring-offset-2' : '',
			'transition-all hover:bg-opacity-70',
		]"
	>
		<!-- Heatmap overlay -->
		<div
			v-if="showHeatmap && heatValue > 0"
			class="absolute inset-0 rounded-sm"
			:style="`background-color: ${heatmapColor}`"
		></div>

		<!-- Piece -->
		<slot></slot>

		<!-- Possible move indicator -->
		<div
			v-if="isPossibleMove"
			class="absolute inset-0 flex items-center justify-center"
		>
			<div class="w-2 h-2 bg-green-500 rounded-full"></div>
		</div>

		<!-- Heat value display -->
		<div
			v-if="showHeatmap && heatValue > 0"
			class="absolute top-0 left-0 text-xs text-white font-medium bg-black/70 px-1 rounded"
		>
			{{ heatValue.toFixed(1) }}
		</div>
	</div>
</template>
