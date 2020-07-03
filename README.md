# chat-client
Basic API client for [bitwave.tv]'s chat. Provides minimal functionality.

Install with:
```bash
npm install @bitwave/chat-client
```

----

## Usage

```js
import bitwaveChat from '@bitwave/chat-client';

/* NOTE: These are the default implementations */

// 'ms' is an array of message objects delivered by the server
bitwaveChat.rcvMessageBulk = ms => {
  for( const m of ms ) {
    console.log( m.message );
  }
};

// Paid alert callback
bitwaveChat.alert = message => {
  console.warn( message );
};

// Global chat setting
bitwaveChat.global = true;

// Connects to chat, to the specified room, with the token
// Note: the token cannot be changed after init()
bitwaveChat.init( 'myroom', 'chat-token' );

bitwaveChat.sendMessage( 'Hello, world!' );
bitwaveChat.room = 'global';
bitwaveChat.sendMessage( 'Hi, global' );

bitwaveChat.sendMessage({
  message: 'Hello, all',
  channel: 'markpugner',
  global: false,
  showBadge: true
});

// Gets all users connected to the current room
// Note: this function will be called automatically, when requested by the server
await bitwaveChat.updateUsernames();
bitwaveChat.channelViewers.forEach( u => {
  console.log( u );
});
```

This is all the library can offer. It's very minimal and is, mostly, just a 
wrapper around the API.

For a more featureful, complete API client, look into the [chat-bot](https://github.com/bitwave-tv/chat-bot).
