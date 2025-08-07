// Test setup file
// Add any global test configuration here

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment below to silence console.log in tests
  // log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);