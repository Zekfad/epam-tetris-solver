/*
  Copyright Islam El-Ashi <islam@elashi.me>
  Copyright Yaroslav Vorobev <zekfad@znnme.eu.org>

  This file is part of El-Tetris.

  El-Tetris is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  El-Tetris is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with El-Tetris.  If not, see <http://www.gnu.org/licenses/>.
*/

import Features from './features.mjs';
import { pieces as globalPieces, } from './pieces.mjs';


/**
 * Handles game dynamics (Choosing a piece, placing a piece, etc...)
 */
class ElTetris {
	/**
	 * Initialize an El-Tetris game.
	 * @param {number} columns - Number of columns in the tetris game.
	 * @param {number} rows - Number of rows in the tetris game.
	 */
	constructor(columns, rows) {
		Object.assign(this, {
			rows,
			columns,
			rowsCompleted: 0,
			// The board is represented as an array of integers, one integer for each row.
			board        : new Array(rows).fill(0),
			fullRow      : Math.pow(2, columns) - 1,
		});
	}
	play(piece, pieces = globalPieces) {
		let move = this.pickMove(piece),
			lastMove = this.playMove(this.board, move.orientation, move.column);

		if (!lastMove.gameOver) {
			this.rowsCompleted += lastMove.rowsRemoved;
		}

		return {
			debug: {
				move,
				lastMove,
				piece,
			},
			column       : move.column,
			orientationId: piece
				.map(props => props.orientation === move.orientation)
				.indexOf(true),
			pieceId: pieces.indexOf(piece),
		};
	}
	/**
	 * Pick the best move possible (orientation and location) as determined by the
	 * evaluation function.
	 *
	 * Given a tetris piece, tries all possible orientations and locations and to
	 * calculate (what it thinks) is the best move.
	 *
	 * @param piece - A tetris piece.
	 *
	 * @returns An object containing the following attributes:
	 * - orientation - The orientation of the piece to use.
	 * - column - The column at which to place the piece.
	 */
	pickMove(piece) {
		let bestEvaluation = -100000,
			bestOrientation = 0,
			bestColumn = 0,
			evaluation = void 0;

		// Evaluate all possible orientations
		for (let i in piece) {
			let orientation = piece[i].orientation;

			// Evaluate all possible columns
			for (let j = 0; j < this.columns - piece[i].width + 1; j++) {
				// Copy current board
				let board = this.board.slice(),
					lastMove = this.playMove(board, orientation, j);

				if (!lastMove.gameOver) {
					evaluation = this.evaluateBoard(lastMove, board);

					if (evaluation > bestEvaluation) {
						bestEvaluation = evaluation;
						bestOrientation = i;
						bestColumn = j;
					}
				}
			}
		}

		return {
			orientation: piece[bestOrientation].orientation,
			column     : bestColumn,
		};
	}
	/**
	 * Evaluate the board, giving a higher score to boards that "look" better.
	 *
	 * @param last_move - An object containing the following information on the
	 * last move played:
	 * - landingHeight: the row at which the last piece was played
	 * - piece: the last piece played
	 * - rowsRemoved: how many rows were removed in the last move
	 *
	 * @returns A number indicating how "good" a board is, the higher the number, the better the board.
	 */
	evaluateBoard(lastMove, board) {
		const features = new Features(board, this.columns);
		return (features.getLandingHeight(lastMove) * -4.500158825082766) +
			(lastMove.rowsRemoved * 3.4181268101392694) +
			(features.getRowTransitions() * -3.2178882868487753) +
			(features.getColumnTransitions() * -9.348695305445199) +
			(features.getNumberOfHoles() * -7.899265427351652) +
			(features.getWellSums() * -3.3855972247263626);
	}

	/**
	 * Play the given piece at the specified location.
	 *
	 * @param piece - The piece to play.
	 * @param column - The column at which to place the piece.
	 *
	 * @returns `true` if play succeeded, `false` if game is over.
	 */
	playMove(board, piece, column) {
		piece = this.movePiece(piece, column);

		let placementRow = this.getPlacementRow(piece),
			rowsRemoved = 0;

		if (placementRow + piece.length > this.rows) {
			// Game over.
			return {
				gameOver: true,
			};
		}

		// Add piece to board.
		for (let i = 0; i < piece.length; i++) {
			board[placementRow + i] |= piece[i];
		}

		// Remove any full rows
		for (let i = 0; i < piece.length; i++) {
			if (this.fullRow === board[placementRow + i]) {
				board.splice(placementRow + i, 1);
				// Add an empty row on top.
				board.push(0);
				// Since we have decreased the number of rows by one, we need to adjust the index accordingly.
				i--;
				rowsRemoved++;
			}
		}

		return {
			gameOver     : false,
			landingHeight: placementRow,
			piece,
			rowsRemoved,
		};
	}
	/**
	 * Given a piece, return the row at which it should be placed.
	 */
	getPlacementRow(piece) {
		const { board, } = this;
		// Descend from top to find the highest row that will collide with the our piece.
		for (let row = this.rows - piece.length; row >= 0; row--) {
			// Check if piece collides with the cells of the current row.
			for (let i = 0; i < piece.length; i++) {
				if ((board[row + i] & piece[i]) !== 0) {
					// Found collision - place piece on row above.
					return row + 1;
				}
			}
		}

		return 0; // No collision found, piece should be placed on first row.
	}
	movePiece(piece, column) {
		// Make a new copy of the piece
		let newPiece = piece.slice();
		for (let i = 0; i < piece.length; i++) {
			newPiece[i] = piece[i] << column;
		}

		return newPiece;
	}
	dumpBoard(board = this.board) {
		let dump = new Array(this.rows)
			.fill(null)
			.map(() =>
				new Array(this.columns)
					.fill(0));

		for (let row = 0; row < this.rows; row++) {
			let rowValue = board[row];
			for (let column = 0; column < this.columns; column++) {
				if (rowValue & 1) {
					dump[row][column] = 1;
				}
				rowValue >>= 1;
			}
		}
		return dump.reverse();
	}
	decodeDump(dump) {
		let board = dump
			.reverse()
			.map(row =>
				row.reduce(
					(accum, cell, i) => accum + Math.pow(cell && 2, i)
				));
		return board;
	}
	loadDump(dump) {
		this.board = this.decodeDump(dump);
	}
	logDump(dump) {
		console.log(
			dump
				.map(row => row.join('.'))
				.join('\n')
		);
	}
}

export default ElTetris;
