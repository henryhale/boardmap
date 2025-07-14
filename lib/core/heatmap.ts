import type { IGameEngine, BoardEntry } from "./engine"

export const HEATMAP = {
	NONE: "",
	INFLUENCE: "influence",
	MOVEMENT: "movement",
	THREAT: "threat",
}

function createBlankGrid(boardSize: number): number[][] {
	return Array(boardSize)
		.fill(null)
		.map(() => Array(boardSize).fill(0))
}

// heatmap calculator
export class HeatmapCalculator {
	static calculateInfluenceHeatmap<T extends BoardEntry>(
		gameEngine: IGameEngine<T>
	) {
		const heatmap = createBlankGrid(gameEngine.boardSize)

		for (let row = 0; row < gameEngine.boardSize; row++) {
			for (let col = 0; col < gameEngine.boardSize; col++) {
				if (gameEngine.board[row][col]) {
					heatmap[row][col] = gameEngine.calculateInfluence(row, col)
				}
			}
		}

		return heatmap
	}

	static calculateMovementHeatmap<T extends BoardEntry>(
		gameEngine: IGameEngine<T>
	) {
		const heatmap = createBlankGrid(gameEngine.boardSize)

		for (let row = 0; row < gameEngine.boardSize; row++) {
			for (let col = 0; col < gameEngine.boardSize; col++) {
				if (gameEngine.board[row][col]) {
					const moves = gameEngine.getPossibleMoves(row, col)
					moves.forEach(([moveRow, moveCol]) => {
						heatmap[moveRow][moveCol] += 1
					})
				}
			}
		}

		return heatmap
	}

	static calculateThreatHeatmap<T extends BoardEntry>(
		gameEngine: IGameEngine<T>
	) {
		const heatmap = createBlankGrid(gameEngine.boardSize)
		const currentPlayer = gameEngine.getCurrentPlayer()

		// Calculate threats from opponent pieces
		for (let row = 0; row < gameEngine.boardSize; row++) {
			for (let col = 0; col < gameEngine.boardSize; col++) {
				const piece = gameEngine.board[row][col]
				if (piece && piece.player !== currentPlayer) {
					// Temporarily switch player to calculate opponent moves
					gameEngine.currentPlayer = piece.player

					const moves = gameEngine.getPossibleMoves(row, col)
					moves.forEach(([moveRow, moveCol]) => {
						heatmap[moveRow][moveCol] += 1

						// Higher threat for squares containing current player's pieces
						if (
							gameEngine.board[moveRow][moveCol] &&
							gameEngine.board[moveRow][moveCol].player ===
								currentPlayer
						) {
							heatmap[moveRow][moveCol] += 2
						}
					})

					// Restore original player
					gameEngine.currentPlayer = currentPlayer
				}
			}
		}

		return heatmap
	}
}
