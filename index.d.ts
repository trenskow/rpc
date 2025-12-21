//
// index.d.ts
// 0-bit-games-frontend-vscode
//
// Created by Kristian Trenskow on 2025/12/21
// See license in LICENSE.
//

type MessageSender = (command: string, data: any) => void;

export interface RPC<D> {

	sender: MessageSender;

	onMessage(
		command: string,
		data: D
	): void;

}

export class Server<T extends object> extends RPC<any[]> {

	private readonly local: T;
	
	constructor(
		local: T,
		sender?: MessageSender
	)

};

interface ClientOptions {
	timeout?: number;
}

export class Client<T extends object> extends RPC<any> {

	readonly remote: T;

	sender: MessageSender;

	constructor(
		sender?: MessageSender,
		options?: ClientOptions
	)

}

function serve<T extends object>(
	handler: T,
	sender: MessageSender
): Server<T>;

function connect<T extends object>(
	sender: MessageSender
): Client<T>;

export default {
	serve,
	connect
};
