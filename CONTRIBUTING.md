# Contributing to polymarket-websocket-client

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 22.0.0 or higher
- pnpm 9.0.0 or higher

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/polymarket-websocket-client.git
   cd polymarket-websocket-client
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm run build
   ```

4. Run tests:
   ```bash
   pnpm run test
   ```

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run build` | Build ESM and CJS outputs |
| `pnpm run test` | Run tests with coverage |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run lint` | Type check with TypeScript |
| `pnpm run clean` | Remove build artifacts |

### Code Style

- **TypeScript**: All code must be written in TypeScript with strict mode enabled
- **No dependencies**: This library has zero runtime dependencies by design
- **Type safety**: Avoid `any` types; use `unknown` with type guards when needed
- **Documentation**: Add JSDoc comments to all public APIs

### Testing

- All new features must include tests
- Maintain test coverage above 95%
- Use the built-in Node.js test runner
- Mock WebSocket connections using the provided `MockWebSocket` utility

Example test:
```typescript
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { MockWebSocket, installMockWebSocket } from './mocks/websocket.js';

describe('MyFeature', () => {
  beforeEach(() => {
    installMockWebSocket();
    MockWebSocket.clearInstances();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. **Create a branch**: Use a descriptive name like `feature/add-new-event` or `fix/reconnection-bug`

2. **Make your changes**: Follow the code style guidelines

3. **Write tests**: Ensure your changes are covered by tests

4. **Update documentation**: Update README.md if adding new features

5. **Update CHANGELOG.md**: Add your changes under `[Unreleased]`

6. **Submit PR**: Include a clear description of the changes

### PR Checklist

- [ ] Tests pass (`pnpm run test`)
- [ ] Type check passes (`pnpm run lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. Node.js version (`node --version`)
2. Package version
3. Minimal reproduction code
4. Expected vs actual behavior
5. Error messages or stack traces

### Feature Requests

For feature requests, please describe:

1. The use case
2. Proposed API design
3. Any alternatives considered

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
