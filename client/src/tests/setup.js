import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts and layout elements
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
