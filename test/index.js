//
// index.js
// 0-bit-games-frontend-vscode
//
// Created by Kristian Trenskow on 2025/12/21
// See license in LICENSE.
//

import { EventEmitter } from 'events';

import { use as chaiUse, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import rpc from '../lib/index.js';

class Transport extends EventEmitter {

	constructor() {
		super();
		this._transports = [];
	}

	addTransport(transport) {
		this._transports.push(transport);
	}

	send(command, data) {
		for (const transport of this._transports) {
			transport.emit('message', {
				command,
				data
			});
		}
	}

};

chaiUse(chaiAsPromised);

const serverTransport = new Transport();
const clientTransport = new Transport();

serverTransport.addTransport(clientTransport);
clientTransport.addTransport(serverTransport);

const server = rpc.serve({
	async add(a, b) {
		return a + b;
	},
	async throwError() {
		throw new Error('This is a test error.');
	},
	timeout() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('done');
			}, 300);
		});
	}
}, (command, data) => {
	serverTransport.send(command, data);
});

const client = rpc.connect((command, data) => {
	clientTransport.send(command, data);
}, {
	timeout: 200
});

serverTransport.on('message', ({ command, data }) => {
	server.onMessage(command, ...data);
});

clientTransport.on('message', ({ command, data }) => {
	client.onMessage(command, data);
});

describe('RPC', () => {

	describe('Basic Functionality', () => {

		it('should perform a basic RPC call', () => {
			return expect(client.remote.add(2, 3)).to.eventually.equal(5);
		});

		it ('should handle errors from the server', () => {
			return expect(client.remote.throwError()).to.be.rejectedWith('This is a test error.');
		});

		it ('should handle timeouts', () => {
			return expect(client.remote.timeout()).to.be.rejectedWith('RPC: Timeout waiting for response.');
		});

	});

});
