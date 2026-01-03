# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-03

### Added

- Initial release
- **CLOB Market Channel Client** (`ClobMarketClient`)
  - Subscribe to orderbook updates by asset IDs (token IDs)
  - Real-time book snapshots, price changes, tick size changes, and last trade prices
  - Typed event callbacks: `onBook()`, `onPriceChange()`, `onTickSizeChange()`, `onLastTradePrice()`
- **CLOB User Channel Client** (`ClobUserClient`)
  - Authenticated channel for user's orders and trades
  - Subscribe by market IDs (condition IDs)
  - Trade and order event callbacks: `onTrade()`, `onOrder()`
- **Unified CLOB Client** (`ClobClient`)
  - Combined access to both market and user channels
  - `connectAll()` for simultaneous connection
- **RTDS Client** (`RtdsClient`)
  - Real-time data streaming from Polymarket
  - Crypto prices (Binance and Chainlink sources)
  - Comments and activity streams
  - Typed subscription methods and callbacks
- **Core Features**
  - Zero runtime dependencies (uses native Node.js 22+ WebSocket)
  - Automatic reconnection with exponential backoff and jitter
  - Configurable heartbeat/ping mechanism
  - Connection timeout handling
  - Comprehensive TypeScript type definitions
  - Dual module output (ESM and CommonJS)
- **Event System**
  - `TypedEventEmitter` base class for type-safe events
  - Connection lifecycle events: `connected`, `disconnected`, `reconnecting`, `error`, `stateChange`
  - Unsubscribe functions returned from all event listeners
