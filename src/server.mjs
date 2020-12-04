/**
	@license
	epam-etris-solver - Solution for EPAM Tetris challange.
	Copyright (C) 2020  Yaroslav Vorobev (zekfad@znnme.eu.org)

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Array2D from 'array2d';
import env from 'dotenv';

import API from './API.mjs';
import ElTetris from './ElTetris.mjs';
import { wssClients, } from './httpServer.mjs';
import { orientationTo2DGrid, piecesMap, } from './pieces.mjs';


const
	config = env.config().parsed,
	api = new API(config.USER, config.TOKEN),
	elTetris = new ElTetris(18, 18);

function stringToDump(string) {
	const rows = [];
	for (let i = 0; i < 18; i++) {
		rows[i] = string.slice(i * 18, (i + 1) * 18);
	}
	return rows
		.map(row => row
			.split('')
			.map(cell =>
				+('.' !== cell)));
}

function equal(array1, array2) {
	if (!Array.isArray(array1) && !Array.isArray(array2)) {
		return array1 === array2;
	}

	if (array1.length !== array2.length) {
		return false;
	}

	for (var i = 0, len = array1.length; i < len; i++) {
		if (!equal(array1[i], array2[i])) {
			return false;
		}
	}

	return true;
}

function parseData(layer, { x, y, type, }) {
	let dump = stringToDump(layer),
		pieceOrientation = 0;


	for (let i = 0; i < piecesMap[type].length; i++) {
		const { orientation, width, height, } = piecesMap[type][i];
		let onMapPiece = Array2D.crop(dump, y, x, width, height),
			knownPiece = Array2D.paste(Array2D.build(width, height, 0), orientationTo2DGrid(orientation), 0, 0);

		if (equal(onMapPiece, knownPiece)) {
			pieceOrientation = i;
			break;
		}
	}

	const { width, height, } = piecesMap[type][pieceOrientation];
	dump = Array2D.paste(dump, Array2D.build(width, height, 0), y, x);

	return {
		board: elTetris.decodeDump(dump),

		x,
		y,
		type,
		orientation: pieceOrientation,
	};
}

function computeCWRotationsCount(oldOrientation, newOrientation, totalOrientations) {
	if (oldOrientation === newOrientation)
		return 0;
	if (
		(newOrientation >= totalOrientations) ||
		(oldOrientation >= totalOrientations) ||
		(totalOrientations <= 0)
	)
		return -1;
	let i;
	for (i = 0; ((oldOrientation + i) % totalOrientations) !== newOrientation; i++);
	return totalOrientations - i; // CCW to CW
}

/* eslint-disable */
const offsetsMap = {
		//    Y,  X
		I: [ -1,  0, ],
		O: [  0,  0, ],
		L: [ -1,  0, ],
		J: [ -1, -1, ],
		S: [ -1, -1, ],
		Z: [ -1, -1, ],
		T: [ -1, -1, ],
	},
	// X offsets. I have no clue where do they comes from.
	rotationsOffsetsMap = {
		I: [ 0,  2, ],
		O: [ 0, ],
		L: [ 0,  1,  1,  1, ],
		J: [ 0,  0, -1,  0, ],
		S: [ 0, -1,  0,  0, ],
		Z: [ 0, -1,  0,  0, ],
		T: [ 0, -1,  0,  0, ],
	};
/* eslint-enable */

api.on('data', ({
	currentFigurePoint: {
		x,
		y,
	},
	currentFigureType,
	layers,
}) => {
	let _y = 17 - y + offsetsMap[currentFigureType][0],
		_x = x + offsetsMap[currentFigureType][1],
		command = 'SKIP';

	if (_y >= 0) {
		const { board, type, orientation, x: newX, } = parseData(layers[0], {
			x: _x,
			y: _y,

			type: currentFigureType,
		});

		elTetris.board = board;
		const
			playResult = elTetris.play(piecesMap[type]),
			rotations = computeCWRotationsCount(orientation, playResult.orientationId, piecesMap[type].length),
			offset = playResult.column - newX + rotationsOffsetsMap[currentFigureType][rotations],
			moveActions = new Array(Math.abs(offset))
				.fill(offset < 0
					? 'LEFT'
					: 'RIGHT'),
			rotationsActions = rotations > 0
				? 'act' + (rotations > 1
					? `(${rotations})`
					: '')
				: '';

		command = [
			...rotationsActions === ''
				? []
				: [ rotationsActions, ],
			...moveActions,
			'DOWN',
		].join(',');
	}

	wssClients.forEach(ws => {
		// Display the future in web debugger.
		ws.send(JSON.stringify(elTetris.dumpBoard()));
	});

	console.log('Sending command:', command);
	api.send(command);
});
