export type BoardEntry = {
	player: string
}

export type GameHistoryEntry = {
	from: [number, number]
	to: [number, number]
}

export interface IGameEngine<T extends BoardEntry = BoardEntry> {
	boardSize: number
	board: T[][]
	currentPlayer: string
	history: GameHistoryEntry[]
	moves: number

	initializeBoard(): T[][]
	isValidMove(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): boolean
	makeMove(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): boolean
	calculateInfluence(row: number, col: number): number
	getPossibleMoves(row: number, col: number): number[][]
	getCurrentPlayer(): string

	resetGame(): void

	updateHistory(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): void
}

// abstract base class for game logic
export abstract class GameEngine<T extends BoardEntry>
	implements IGameEngine<T>
{
	boardSize: number
	board: T[][]
	currentPlayer!: string
	history: GameHistoryEntry[]

	constructor(boardSize: number) {
		this.boardSize = boardSize
		this.board = this.initializeBoard()
		this.history = []
	}

	get moves(): number {
		return this.history.length
	}

	abstract initializeBoard(): T[][]

	abstract isValidMove(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): boolean

	abstract makeMove(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): boolean

	abstract calculateInfluence(row: number, col: number): number

	abstract getPossibleMoves(row: number, col: number): number[][]

	abstract getCurrentPlayer(): string

	abstract resetGame(): void

	updateHistory(
		fromRow: number,
		fromCol: number,
		toRow: number,
		toCol: number
	): void {
		this.history.push({ from: [fromRow, fromCol], to: [toRow, toCol] })
	}
}
