/**
	@license
	epam-tetris-solver - Solution for EPAM Tetris challange.
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

import { EventEmitter, } from 'events';

import WebSocket from 'ws';


class API extends EventEmitter {
	constructor(user, token, game = 'tetris') {
		super();
		Object.assign(this, {
			apiEndpoint: 'ws://codebattle2020.westeurope.cloudapp.azure.com/codenjoy-contest/ws' +
				`?user=${user}&code=${token}&gameName=${game}`,
			ws: null,
		});
		this.ws = this.openWS();
	}
	openWS(apiEndpoint = this.apiEndpoint) {
		const ws = new WebSocket(apiEndpoint);
		ws.on('open', this.onOpen.bind(this));
		ws.on('close', this.onClose.bind(this));
		ws.on('message', this.onData.bind(this));
		ws.on('error', this.onError.bind(this));
		return ws;
	}
	onOpen() {
		console.log('API connected.');
	}
	onClose() {
		console.log('API disconnected.');
		console.log('Reconnecting to API.');
		this.ws = this.openWS();
	}
	onData(data) {
		this.emit(
			'data',
			JSON.parse(
				data.replace('board=', '')
			)
		);
	}
	onError(error) {
		console.error('API: Unknown error.');
		console.error(error);
	}
	send(data) {
		try {
			this.ws.send(data);
		} catch (error) {
			console.error('API: Error while sending data.');
			console.error(error);
		}
	}
}
export default API;
