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

function createOrientation(str) {
	return str
		.split('\n')
		.map(row => row.trim())
		.filter(row => row)
		.map(row => parseInt(
			row.split('')
				.reverse()
				.join(''),
			2
		))
		.reverse();
}

function orientationTo2DGrid(orientation) {
	return orientation
		.map(row => row
			.toString(2)
			.split('')
			.map(cell => +cell)
			.reverse())
		.reverse();
}

/**
 * Defines the shapes and dimensions of the tetrominoes.
 */
const pieces = [
	/**
	 * I piece
	 */
	[
		{
			orientation: createOrientation(`
				1
				1
				1
				1
			`),
			width : 1,
			height: 4,
		},
		{
			orientation: createOrientation(`
				1111
			`),
			width : 4,
			height: 1,
		},
	],
	/**
	 * T piece
	 */
	[
		{
			orientation: createOrientation(`
				10
				11
				10
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				010
				111
			`),
			width : 3,
			height: 2,
		},
		{
			orientation: createOrientation(`
				01
				11
				01
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				111
				010
			`),
			width : 3,
			height: 2,
		},
	],
	/**
	 * O piece
	 */
	[
		{
			orientation: createOrientation(`
				11
				11
			`),
			width : 2,
			height: 2,
		},
	],
	/**
	 * J piece
	 */
	[
		{
			orientation: createOrientation(`
				100
				111
			`),
			width : 3,
			height: 2,
		},
		{
			orientation: createOrientation(`
				01
				01
				11
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				111
				001
			`),
			width : 3,
			height: 2,
		},
		{
			orientation: createOrientation(`
				11
				10
				10
			`),
			width : 2,
			height: 3,
		},
	],
	/**
	 * L piece
	 */
	[
		{
			orientation: createOrientation(`
				111
				100
			`),
			width : 3,
			height: 2,
		},
		{
			orientation: createOrientation(`
				10
				10
				11
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				001
				111
			`),
			width : 3,
			height: 2,
		},
		{
			orientation: createOrientation(`
				11
				01
				01
			`),
			width : 2,
			height: 3,
		},
	],
	/**
	 * S piece
	 */
	[
		{
			orientation: createOrientation(`
				10
				11
				01
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				011
				110
			`),
			width : 3,
			height: 2,
		},
	],
	/**
	 * Z piece
	 */
	[
		{
			orientation: createOrientation(`
				01
				11
				10
			`),
			width : 2,
			height: 3,
		},
		{
			orientation: createOrientation(`
				110
				011
			`),
			width : 3,
			height: 2,
		},
	],
];


let piecesMapNames = [
	'I', 'T', 'O', 'J', 'L', 'S', 'Z',
];

const piecesMap = {};

for (let i = 0; i < piecesMapNames.length; i++) {
	const pieceName = piecesMapNames[i];
	piecesMap[pieceName] = pieces[i];
}

function getPieceNameFromMap(piece, _piecesMap = piecesMap) {
	for (const key in piecesMap) {
		if (
			Object.prototype.hasOwnProperty.call(_piecesMap, key) &&
			piece === piecesMap[key]
		)
			return key;
	}
}

export {
	pieces,
	piecesMap,
	getPieceNameFromMap,
	createOrientation,
	orientationTo2DGrid,
};
