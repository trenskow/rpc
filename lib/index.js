//
// index.js
// 0-bit-games-frontend-vscode
//
// Created by Kristian Trenskow on 2025/12/21
// See license in LICENSE.
//

import keyd from 'keyd';
import { deflate, inflate } from '@trenskow/json-compressor';

export class Server {

	constructor(
		local,
		sender
	) {

		this.sender = sender;

		this._local = local;

	}

	get local() {
		return this._local;
	}

	onMessage(
		command,
		data
	) {

		const parts = command.split(':');

		if (parts[0] !== 'call') {
			return;
		}

		const identifier = parts[1];

		const methodName = parts[2];

		const method = keyd(this._local).get(methodName);

		if (typeof method !== 'function') {
			throw new Error(`RPC: Method ${methodName} is not a function on the handler.`);
		}

		Promise.resolve(
			method(...inflate(data))
		).then((result) => {
			this.sender(
				`response:${identifier}`,
				deflate(result)
			);
		}).catch((error) => {
			this.sender(
				`error:${identifier}`,
				deflate(Object.assign({}, error ?? { message: 'Unknown error' }, {
					message: error?.message,
					stack: error?.stack
				}))
			);
		});

	}

};

export class Client {

	constructor(
		sender,
		options = {}
	) {

		this.sender = sender;

		this._responses = new Map();
		this._identifierCounter = 0;
		this._options = options;

	}

	_proxy(keyPath = []) {
		return new Proxy(function() {}, {
			get: (_target, prop) => {
				return this._proxy(keyPath.concat([prop]));
			},
			apply: (_target, _thisArg, args) => {

				const identifier = (this._identifierCounter++).toString();

				return new Promise((resolve, reject) => {

					const response = {
						resolve,
						reject
					};

					if (typeof this._options?.timeout === 'number') {
						response.timeout = setTimeout(() => {
							this._responses.delete(identifier);
							reject(new Error('RPC: Timeout waiting for response.'));
						}, this._options.timeout ?? 5000);
					}

					this._responses.set(
						identifier,
						response);

					this.sender(
						`call:${identifier}:${keyPath.join('.')}`,
						deflate(args));

				});

			}
		});
	}

	get remote() {
		return this._proxy();
	}

	onMessage(
		command,
		data
	) {

		const parts = command.split(':');

		const type = parts[0];
		const identifier = parts[1];

		if (type !== 'response' && type !== 'error') {
			return;
		}

		const responseHandler = this._responses.get(identifier);

		if (!responseHandler) {
			return;
		}

		if (responseHandler?.timeout) {
			clearTimeout(responseHandler.timeout);
		}

		this._responses.delete(identifier);

		data = inflate(data);

		if (type === 'response') {
			responseHandler.resolve(data);
		} else if (type === 'error') {

			let error = Object.assign(new Error(data?.message || 'Unknown error'), data);

			if (typeof this._options?.sanitizeErrors === 'function') {
				error = this._options.sanitizeErrors(error);
			}

			responseHandler.reject(error);

		}

	}

}

export default {
	serve: function(
		handler,
		sender
	) {
		return new Server(
			handler,
			sender);
	},
	connect: function(
		sender,
		options
	) {
		return new Client(
			sender,
			options);
	}
};
