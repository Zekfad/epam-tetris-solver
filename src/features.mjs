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

/**
 * This file is the core of the El-Tetris algorithm.
 *
 * Features that are used by the algorithm are implemented here.
 */
class Features {
	constructor(board, numColumns) {
		Object.assign(this, {
			board,
			numColumns,
		});
	}
	getLandingHeight(lastMove) {
		return lastMove.landingHeight + ((lastMove.piece.length - 1) / 2);
	}
	/**
	 * The total number of row transitions.
	 * A row transition occurs when an empty cell is adjacent to a filled cell
	 * on the same row and vice versa.
	 */
	getRowTransitions() {
		const { board, numColumns, } = this;
		let transitions = 0,
			lastBit = 1;

		for (let i = 0; i < board.length; ++i) {
			let row = board[i],
				bit;

			for (let j = 0; j < numColumns; ++j) {
				bit = (row >> j) & 1;

				if (bit !== lastBit) {
					++transitions;
				}

				lastBit = bit;
			}

			if (0 === bit) {
				++transitions;
			}

			lastBit = 1;
		}
		return transitions;
	}
	/**
	 * The total number of column transitions.
	 * A column transition occurs when an empty cell is adjacent to a filled cell
	 * on the same row and vice versa.
	 */
	getColumnTransitions() {
		const { board, numColumns, } = this;
		let transitions = 0,
			lastBit = 1;

		for (let i = 0; i < numColumns; ++i) {
			for (let j = 0; j < board.length; ++j) {
				let row = board[j],
					bit = (row >> i) & 1;

				if (bit !== lastBit) {
					++transitions;
				}

				lastBit = bit;
			}

			lastBit = 1;
		}

		return transitions;
	}
	getNumberOfHoles() {
		const { board, numColumns, } = this;
		let holes = 0,
			rowHoles = 0x0000,
			previousRow = board[board.length - 1];

		for (let i = board.length - 2; i >= 0; --i) {
			rowHoles = ~board[i] & (previousRow | rowHoles);

			for (let j = 0; j < numColumns; ++j) {
				holes += (rowHoles >> j) & 1;
			}

			previousRow = board[i];
		}

		return holes;
	}
	/**
	 * A well is a sequence of empty cells above the top piece in a column such
	 * that the top cell in the sequence is surrounded (left and right) by occupied
	 * cells or a boundary of the board.
	 * @returns The well sums. For a well of length n, we define the well sums as
	 * 1 + 2 + 3 + ... + n. This gives more significance to deeper holes.
	 */
	getWellSums() {
		const { board, numColumns, } = this;
		let wellSums = 0;

		// Check for well cells in the "inner columns" of the board.
		// "Inner columns" are the columns that aren't touching the edge of the board.
		for (let i = 1; i < numColumns - 1; ++i) {
			for (let j = board.length - 1; j >= 0; --j) {
				if ((((board[j] >> i) & 1) === 0) &&
					(((board[j] >> (i - 1)) & 1) === 1) &&
					(((board[j] >> (i + 1)) & 1) === 1)) {

					// Found well cell, count it + the number of empty cells below it.
					++wellSums;

					for (let k = j - 1; k >= 0; --k) {
						if (((board[k] >> i) & 1) === 0) {
							++wellSums;
						} else {
							break;
						}
					}
				}
			}
		}

		// Check for well cells in the leftmost column of the board.
		for (let j = board.length - 1; j >= 0; --j) {
			if ((((board[j] >> 0) & 1) === 0) &&
				(((board[j] >> (0 + 1)) & 1) === 1)) {

				// Found well cell, count it + the number of empty cells below it.
				++wellSums;

				for (let k = j - 1; k >= 0; --k) {
					if (((board[k] >> 0) & 1) === 0) {
						++wellSums;
					} else {
						break;
					}
				}
			}
		}

		// Check for well cells in the rightmost column of the board.
		for (let j = board.length - 1; j >= 0; --j) {
			if ((((board[j] >> (numColumns - 1)) & 1) === 0) &&
				(((board[j] >> (numColumns - 2)) & 1) === 1)) {
				// Found well cell, count it + the number of empty cells below it.

				++wellSums;
				for (let k = j - 1; k >= 0; --k) {
					if (((board[k] >> (numColumns - 1)) & 1) === 0) {
						++wellSums;
					} else {
						break;
					}
				}
			}
		}

		return wellSums;
	}
}

export default Features;
