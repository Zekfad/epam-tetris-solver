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

/* eslint-env browser */
import ElTetris from './ElTetris.mjs';
import Renderer from './renderer.mjs';


const
	renderer = new Renderer(18, 18, 24, document.getElementById('board')),
	elTetris = new ElTetris(18, 18);

class WS {
	constructor(url) {
		Object.assign(this, {
			apiEndpoint: url,
			ws         : null,
		});
		const ws = this.openWS();
		this.ws = ws;
	}
	openWS(apiEndpoint = this.apiEndpoint) {
		const ws = new WebSocket(apiEndpoint);
		ws.onopen = this._onOpen.bind(this);
		ws.onclose = this._onClose.bind(this);
		ws.onmessage = this._onData.bind(this);
		ws.onerror = this.onError.bind(this);
		return ws;
	}
	_onOpen(...args) {
		this.onOpen
			.bind(this)
			.call(this, ...args);
		console.log('API connected.');
	}
	onOpen() { } // Overload me
	_onClose(...args) {
		this.onClose
			.bind(this)
			.call(this, ...args);
		console.log('API disconnected.');
		console.log('Reconnecting to API.');
		this.ws = this.openWS();
	}
	onClose() { } // Overload me
	_onData(...args) {
		this.onData
			.bind(this)
			.call(this, ...args);
	}
	onData() {} // Overload me
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

const
	ws = new WS('ws://localhost:801/ws'),
	ansiUp = new AnsiUp(), // eslint-disable-line no-undef
	logWindow = document.getElementById('log'),
	colorInspect = data => inspect( // eslint-disable-line no-undef
		data,
		{ colors: true, }
	);

ws.onOpen = () => {
	logWindow.innerHTML = 'CONNECTED';
};

ws.onData = event => {
	const {
		local,
		serverFrame,
		board,
	} = JSON.parse(event.data);
	elTetris.loadDump(board.new);
	renderer.draw(elTetris.board);
	logWindow.innerHTML = ansiUp.ansi_to_html(`
- Local -
Attached web debuggers: ${local.debuggerClients}

- Remote -
Latest server frame:

${colorInspect(serverFrame)}
	`.trim());

};

ws.onClose = () => {
	logWindow.innerHTML = 'DISCONNECTED';
};

renderer.draw(elTetris.board);
