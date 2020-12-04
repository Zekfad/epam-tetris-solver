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

import { stat, readFile, } from 'fs';
import { createServer, } from 'http';
import { parse, } from 'url';

import WebSocket from 'ws';


const server = createServer(
		(request, response) => {
			var path = './src' + request.url.slice(
				0,
				(request.url.indexOf('?') + 1 || request.url.length + 1) - 1
			);

			stat(path, (badPath, pathStat) => {
				if (badPath)
					respond(404);
				else if (pathStat.isDirectory() && path.slice(-1) !== '/') {
					response.setHeader('Location', path.slice(11) + '/');
					respond(301);
				} else {
					let filePath = path.slice(-1) === '/' ? path + 'index.html' : path;
					readFile(
						filePath,
						(badFile, fileContent) => {
							if (badFile)
								respond(404);
							else {
								if (filePath.endsWith('.mjs'))
									response.setHeader('Content-Type', 'text/javascript');
								respond(200, fileContent);
							}
						}
					);
				}
			});

			function respond(status, content) {
				response.statusCode = status;
				response.end(content);
			}
		}
	)
		.listen(801, () => {
			console.log('Server running on port 801...');
		}),
	wss = new WebSocket.Server({ noServer: true, }),
	wssClients = new Set();

wss.on('connection', (ws) => {
	wssClients.add(ws);

	ws.on('message', (message) => {
		console.log('received: %s', message);
	});

	ws.on('close', () => {
		wssClients.delete(ws);
	});
});

server.on('upgrade', function upgrade(request, socket, head) {
	const pathname = parse(request.url).pathname;

	if (pathname === '/ws') {
		wss.handleUpgrade(request, socket, head, function done(ws) {
			wss.emit('connection', ws, request);
		});
	} else {
		socket.destroy();
	}
});

export {
	server,
	wss,
	wssClients,
};
