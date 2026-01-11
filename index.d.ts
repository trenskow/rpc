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

export class Server<T extends object> implements RPC<any[]> {

	private readonly local: T;

	sender: MessageSender;
	
	constructor(
		local: T,
		sender?: MessageSender
	)

	onMessage(
		command: string,
		data: any[]
	): void;

}

interface ClientOptions {
	timeout?: number;
	sanitizeErrors?: (error: Error) => Error;
}

export class Client<T extends object> implements RPC<any> {

	readonly remote: T;

	sender: MessageSender;

	constructor(
		sender?: MessageSender,
		options?: ClientOptions
	)

	onMessage(
		command: string,
		data: any
	): void;

}

type Serve = <T extends object>(
	handler: T,
	sender: MessageSender
) => Server<T>;

type Connect = <T extends object>(
	sender: MessageSender
) => Client<T>;

declare const rpc: {
	serve: Serve;
	connect: Connect;
}

export default rpc;
