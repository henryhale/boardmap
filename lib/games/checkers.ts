import { GameEngine, BoardEntry } from "../core"

const BOARD_SIZE = 8

export enum PLAYER {
	BLACK = "BLACK",
	WHITE = "WHITE"
}

export interface Piece extends BoardEntry {
	player: PLAYER
	king: boolean
}

// checkers 
export class Engine extends GameEngine<Piece> {

	currentPlayer: PLAYER

	constructor() {
		super(BOARD_SIZE);
		this.currentPlayer = PLAYER.BLACK;
	}

	initializeBoard(): Piece[][] {
		const board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));

		// Place white pieces (top)
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < this.boardSize; col++) {
				if ((row + col) % 2 === 1) {
					board[row][col] = { player: PLAYER.WHITE, king: false };
				}
			}
		}

		// Place black pieces (bottom)
		for (let row = 5; row < this.boardSize; row++) {
			for (let col = 0; col < this.boardSize; col++) {
				if ((row + col) % 2 === 1) {
					board[row][col] = { player: PLAYER.BLACK, king: false };
				}
			}
		}

		return board;
	}

	isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
		const piece = this.board[fromRow][fromCol];
		if (!piece || piece.player !== this.currentPlayer) return false;
		if (this.board[toRow][toCol]) return false;

		const rowDiff = toRow - fromRow;
		const colDiff = Math.abs(toCol - fromCol);

		if (piece.king) {
			// Kings can move diagonally any distance
			if (Math.abs(rowDiff) === colDiff && Math.abs(rowDiff) > 0) {
				const stepRow = Math.sign(rowDiff);
				const stepCol = Math.sign(toCol - fromCol);

				// Check path is clear (except for potential jump)
				let jumpedPiece;
				let jumpedCount = 0;

				for (let step = 1; step < Math.abs(rowDiff); step++) {
					const checkRow = fromRow + stepRow * step;
					const checkCol = fromCol + stepCol * step;
					const pieceAtPos = this.board[checkRow][checkCol];

					if (pieceAtPos) {
						if (pieceAtPos.player === piece.player) return false;
						jumpedPiece = pieceAtPos;
						jumpedCount++;
						if (jumpedCount > 1) return false; // Can only jump one piece
					}
				}

				return true;
			}
			return false;
		}

		// Regular pieces
		if (Math.abs(rowDiff) === 1 && colDiff === 1) {
			return piece.player === PLAYER.WHITE ? rowDiff > 0 : rowDiff < 0;
		}

		// Jump moves for regular pieces
		if (Math.abs(rowDiff) === 2 && colDiff === 2) {
			const midRow = fromRow + rowDiff / 2;
			const midCol = fromCol + (toCol - fromCol) / 2;
			const jumpedPiece = this.board[midRow][midCol];

			if (jumpedPiece && jumpedPiece.player !== piece.player) {
				return piece.player === PLAYER.WHITE ? rowDiff > 0 : rowDiff < 0;
			}
		}

		return false;
	}

	makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
		if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;

		const piece = this.board[fromRow][fromCol];
		this.board[toRow][toCol] = piece;
		delete this.board[fromRow][fromCol];

		// Handle jumps
		if (piece.king) {
			// King jumps - remove jumped piece along the diagonal
			const stepRow = Math.sign(toRow - fromRow);
			const stepCol = Math.sign(toCol - fromCol);

			for (let step = 1; step < Math.abs(toRow - fromRow); step++) {
				const checkRow = fromRow + stepRow * step;
				const checkCol = fromCol + stepCol * step;
				if (this.board[checkRow][checkCol]) {
					delete this.board[checkRow][checkCol];
					break;
				}
			}
		} else if (Math.abs(toRow - fromRow) === 2) {
			// Regular piece jump
			const midRow = fromRow + (toRow - fromRow) / 2;
			const midCol = fromCol + (toCol - fromCol) / 2;
			delete this.board[midRow][midCol];
		}

		// King promotion
		if ((piece.player === PLAYER.WHITE && toRow === 7) || (piece.player === PLAYER.BLACK && toRow === 0)) {
			piece.king = true;
		}

		this.currentPlayer = this.currentPlayer === PLAYER.WHITE ? PLAYER.BLACK : PLAYER.WHITE;

		this.updateHistory(fromRow, fromCol, toRow, toCol);

		return true;
	}

	calculateInfluence(row: number, col: number): number {
		const piece = this.board[row][col];
		if (!piece) return 0;

		let influence = 1;
		const moves = this.getPossibleMoves(row, col);
		influence += moves.length * 0.3;

		// Add strategic position bonuses
		if (piece.king) influence += 2;
		if (row === 0 || row === 7) influence += 0.5; // Back row
		if (col === 0 || col === 7) influence += 0.3; // Side protection

		return Math.min(influence, 5);
	}

	getPossibleMoves(row: number, col: number): number[][] {
		const moves: number[][] = [];
		const piece = this.board[row][col];
		if (!piece) return moves;

		const directions = piece.king ?
			[[-1, -1], [-1, 1], [1, -1], [1, 1]] :
			piece.player === PLAYER.WHITE ?
				[[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];

		for (const [dr, dc] of directions) {
			if (piece.king) {
				// Kings can move multiple steps
				for (let step = 1; step < this.boardSize; step++) {
					const newRow = row + dr * step;
					const newCol = col + dc * step;

					if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) break;

					if (!this.board[newRow][newCol]) {
						moves.push([newRow, newCol]);
					} else {
						// Can jump over opponent piece
						if (this.board[newRow][newCol].player !== piece.player) {
							const jumpRow = newRow + dr;
							const jumpCol = newCol + dc;
							if (jumpRow >= 0 && jumpRow < this.boardSize && jumpCol >= 0 && jumpCol < this.boardSize && !this.board[jumpRow][jumpCol]) {
								moves.push([jumpRow, jumpCol]);
							}
						}
						break;
					}
				}
			} else {
				// Regular pieces - single step moves
				const newRow = row + dr;
				const newCol = col + dc;

				if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
					if (this.isValidMove(row, col, newRow, newCol)) {
						moves.push([newRow, newCol]);
					}

					// Check for jumps
					const jumpRow = row + dr * 2;
					const jumpCol = col + dc * 2;
					if (jumpRow >= 0 && jumpRow < this.boardSize && jumpCol >= 0 && jumpCol < this.boardSize) {
						if (this.isValidMove(row, col, jumpRow, jumpCol)) {
							moves.push([jumpRow, jumpCol]);
						}
					}
				}
			}
		}

		return moves;
	}

	getCurrentPlayer(): string {
		return this.currentPlayer;
	}

	resetGame(): void {
		this.board = this.initializeBoard();
    	this.currentPlayer = PLAYER.BLACK;
		this.history = [];
    	// setSelectedSquare(null);
	}

}
