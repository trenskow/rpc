@trenskow/rpc
----

A simple RPC server and client for JavaScript.

# Usage

Below is an example on how to use.

> The transport layer must be provided with a message sender and receiver.
> In this example we just use an imaginary method called `onDidReceiveMessage(data)` to receive data.
> Then we use another imaginary method called `sendMessage(data)` to send data.

## Server

````javascript
import rpc from '@trenskow/rpc';

const server = rpc.serve(
  {
    hello: async (name) => {
      return `Hello, ${name}!.`;
    },
    /* Other methods available. */
  },
  (command, data) => {
    sendMessage({ command, data });
  }
);

onDidReceiveMessage(({ command, data }) => {
  server.onMessage(command, data);
});

````

## Client

````javascript
import rpc from '@trenskow/rpc';

const client = rpc.connect(
  (command, data) => {
    sendMessage({ command, data })
  }
);

await client.remote.hello('World'); // Returns 'Hello, World!'

onDidReceiveMessage({ command, data }) => {
  client.onMessage(command, data);
});
````

# License

See license in LICENSE.
