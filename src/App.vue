<script setup lang="ts">
import { ref, computed } from "vue"
import {
	SettingsIcon,
	EyeIcon,
	RotateCcwIcon,
	TargetIcon,
	CrownIcon,
} from "lucide-vue-next"
import BoardEntry from "./components/BoardEntry.vue"
import { HEATMAP, HeatmapCalculator } from "../lib/core"
import { Engine, PLAYER } from "../lib/games/checkers"

const gameEngine = new Engine()

const blankGrid: number[][] = Array(gameEngine.boardSize)
	.fill(null)
	.map(() => Array(gameEngine.boardSize).fill(0))

const selectedSquare = ref<[number, number] | null>(null)
const heatmapType = ref<string>(HEATMAP.INFLUENCE)
const showHeatmap = ref<boolean>(true)

const heatmap = computed<number[][]>(() => {
	if (selectedSquare.value || showHeatmap.value) {
		/* noop - just subscribe to update values on every move */
	}
	switch (heatmapType.value) {
		case HEATMAP.INFLUENCE:
			return HeatmapCalculator.calculateInfluenceHeatmap(gameEngine)
		case HEATMAP.MOVEMENT:
			return HeatmapCalculator.calculateMovementHeatmap(gameEngine)
		case HEATMAP.THREAT:
			return HeatmapCalculator.calculateThreatHeatmap(gameEngine)
		default:
			return blankGrid
	}
})

const maxHeatValue = computed<number>(() => Math.max(...heatmap.value.flat()))

const getHeatmapColor = (value: number): string => {
	if (value === 0) return "transparent"
	const intensity = value / maxHeatValue.value
	switch (heatmapType.value) {
		case HEATMAP.INFLUENCE:
			return `rgba(59, 130, 246, ${intensity * 0.7})`
		case HEATMAP.MOVEMENT:
			return `rgba(34, 197, 94, ${intensity * 0.7})`
		case HEATMAP.THREAT:
			return `rgba(239, 68, 68, ${intensity * 0.7})`
		default:
			return "transparent"
	}
}

const handleSquareClick = (row: number, col: number) => {
	if (selectedSquare.value) {
		const [fromRow, fromCol] = selectedSquare.value
		if (gameEngine.makeMove(fromRow, fromCol, row, col)) {
			selectedSquare.value = null
		} else if (
			gameEngine.board[row][col]?.player === gameEngine.getCurrentPlayer()
		) {
			selectedSquare.value = [row, col]
		} else {
			selectedSquare.value = null
		}
	} else if (
		gameEngine.board[row][col]?.player === gameEngine.getCurrentPlayer()
	) {
		selectedSquare.value = [row, col]
	}
}

const possibleMoves = computed(() => {
	if (!selectedSquare.value) return []
	const [row, col] = selectedSquare.value
	return gameEngine.getPossibleMoves(row, col)
})

const resetGame = () => {
	gameEngine.resetGame()
	selectedSquare.value = null
	heatmapType.value = HEATMAP.NONE
	showHeatmap.value = false
}
</script>

<template>
	<div class="min-h-screen bg-gray-100 p-4">
		<div class="max-w-4xl mx-auto">
			<div class="mb-8">
				<h1
					class="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-4"
				>
					<img src="/logo.svg" class="size-8" />
					<span>Boardmap</span>
				</h1>
				<p class="text-gray-600 text-center">
					A board game heatmap visualizer providing real-time
					strategic pattern recognition for enhanced gameplay.
					<a
						href="https://github.com/henryhale/boardmap"
						class="text-gray-700 hover:underline text-sm font-semibold"
						>Learn more &rarr;</a
					>
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!--  Controls -->
				<div
					class="lg:col-span-1 gap-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1"
				>
					<div
						class="bg-white rounded-lg p-4 shadow-sm border border-gray-300"
					>
						<h3
							class="text-gray-800 font-semibold mb-3 flex items-center gap-2"
						>
							<SettingsIcon class="size-4" />
							Controls
						</h3>

						<div class="space-y-3">
							<div>
								<label class="block text-sm text-gray-600 mb-1"
									>Board Game</label
								>
								<select
									class="w-full bg-white border border-gray-300 text-gray-800 rounded px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
								>
									<option value="checkers">Checkers</option>
								</select>
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1"
									>Heatmap Type</label
								>
								<select
									v-model="heatmapType"
									class="w-full bg-white border border-gray-300 text-gray-800 rounded px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
								>
									<option value="">None</option>
									<option value="influence">
										Piece Influence
									</option>
									<option value="movement">
										Movement Options
									</option>
									<option value="threat">
										Threat Analysis
									</option>
								</select>
							</div>

							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									id="showHeatmap"
									v-model="showHeatmap"
									class="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
								/>
								<label
									htmlFor="showHeatmap"
									class="text-sm text-gray-600 flex items-center gap-1"
								>
									<EyeIcon class="size-4" />
									Show Heatmap
								</label>
							</div>

							<button
								@click="resetGame"
								class="w-full bg-gray-800/90 hover:bg-gray-800 text-white rounded px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
							>
								<RotateCcwIcon class="size-4" />
								Reset Game
							</button>
						</div>
					</div>

					<!-- Game Info -->
					<div
						class="bg-white rounded-lg p-4 shadow-sm border border-gray-300"
					>
						<h3 class="text-gray-800 font-semibold mb-2">
							Game Status
						</h3>
						<div class="space-y-2 text-sm text-gray-600">
							<p class="flex items-center gap-x-4">
								<span>Current Player:</span>
								<span class="font-bold uppercase">
									{{ gameEngine.getCurrentPlayer() }}
								</span>
								<span
									class="bg-gray-200 size-6 flex items-center justify-center"
								>
									<span
										:class="[
											'size-4 inline-block rounded-full border-x-2 border-t-0 border-b-8',
											gameEngine.getCurrentPlayer() ===
											PLAYER.WHITE
												? 'bg-white border-gray-400'
												: 'bg-gray-700 border-gray-900',
										]"
									></span>
								</span>
							</p>
							<p>
								Moves: <b>{{ gameEngine.moves }}</b>
							</p>
							<p
								v-show="selectedSquare"
								class="mt-2 text-amber-600"
							>
								<TargetIcon
									class="size-4 inline mr-1 animate-pulse"
								/>
								{{ possibleMoves.length }} possible moves
							</p>
						</div>
					</div>

					<!-- Legend -->
					<div
						class="bg-white rounded-lg p-4 shadow-sm border border-gray-300"
					>
						<h3 class="text-gray-800 font-semibold mb-2">Legend</h3>
						<div class="space-y-2 text-xs text-gray-600">
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 bg-blue-500/80 rounded border border-blue-500"
								></div>
								<span>Influence</span>
							</div>
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 bg-green-500/80 rounded border border-green-500"
								></div>
								<span>Movement</span>
							</div>
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 bg-red-500/80 rounded border border-red-500"
								></div>
								<span>Threat</span>
							</div>
							<div class="flex items-center gap-2">
								<div
									class="w-4 h-4 bg-amber-400/80 rounded border border-amber-500"
								></div>
								<span>Selected</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Game Board  -->
				<div class="lg:col-span-2">
					<div
						class="aspect-square max-w-xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-300"
					>
						<div class="grid grid-cols-8 gap-1 h-full">
							<template
								v-for="(list, row) in blankGrid"
								:key="row"
							>
								<BoardEntry
									v-for="(_, col) in list"
									:key="`${row}-${col}`"
									:isBlackSquare="(row + col) % 2 === 1"
									:isSelected="
										selectedSquare &&
										selectedSquare[0] === row &&
										selectedSquare[1] === col
									"
									:isPossibleMove="
										possibleMoves.some(
											([r, c]) => r === row && c === col
										)
									"
									:showHeatmap="showHeatmap"
									:heatValue="heatmap[row][col]"
									:heatmapColor="
										getHeatmapColor(heatmap[row][col])
									"
									@click="handleSquareClick(row, col)"
								>
									<div
										v-if="gameEngine.board[row][col]"
										:class="[
											'absolute inset-1 rounded-full border-x-2 border-t-0 border-b-8',
											gameEngine.board[row][col]
												?.player === PLAYER.WHITE
												? 'bg-white border-gray-400'
												: 'bg-gray-700 border-gray-900',
											{
												'shadow-lg':
													gameEngine.board[row][col]
														?.king,
											},
											'flex items-center justify-center',
										]"
									>
										<div
											v-if="
												gameEngine.board[row][col]?.king
											"
											class="text-yellow-300 text-xs font-bold"
										>
											<CrownIcon class="size-4" />
										</div>
									</div>
								</BoardEntry>
							</template>
						</div>
					</div>
				</div>
			</div>

			<div class="sr-only">
				Made with ❤️ by
				<a href="https://github.com/henryhale">Henry Hale</a>
			</div>
		</div>
	</div>
</template>
