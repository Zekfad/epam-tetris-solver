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

/* eslint-env browser */

class Renderer {
	constructor(columns, rows, squareSize, canvas) {
		Object.assign(this, {
			rows,
			columns,
			squareSize,
			context    : canvas.getContext('2d'),
			startX     : 0.5,
			startY     : 0.5,
			squareColor: '#00FF00',
			strokeColor: '#eee',
		});
	}
	drawGrid() {
		let nColumnLines = this.columns + 1;

		this.context.beginPath();
		for (let x = 0.5, i = 0; i < nColumnLines; x += this.squareSize, i++) {
			this.context.moveTo(x, 0);
			this.context.lineTo(x, this.rows * this.squareSize);
		}

		let nRowLines = this.rows + 1;
		for (let y = 0.5, i = 0; i < nRowLines; y += this.squareSize, i++) {
			this.context.moveTo(0, y);
			this.context.lineTo(this.columns * this.squareSize, y);
		}

		this.context.strokeStyle = this.strokeColor;
		this.context.stroke();
	}
	draw(board) {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		this.drawGrid();

		for (let row = 0; row < this.rows; row++) {
			this.fillRow(row, board[row]);
		}
	}
	fillCell(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(
			this.startX + (x * this.squareSize),
			this.startY + ((this.rows - 1 - y) * this.squareSize),
			this.squareSize,
			this.squareSize
		);
	}
	fillRow(rowNumber, rowValue) {
		for (let i = 0; i < this.columns && rowValue !== 0; i++) {
			if (rowValue & 1) {
				this.fillCell(i, rowNumber, this.squareColor);
			}
			rowValue >>= 1;
		}
	}
}

export default Renderer;
