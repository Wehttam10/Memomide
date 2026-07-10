import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Polyfill Promise.withResolvers if not exists
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Mock window.alert
window.alert = vi.fn();

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock mammoth
vi.mock('mammoth', () => {
  return {
    default: {
      extractRawText: vi.fn().mockResolvedValue({ value: 'Parsed Word Content' }),
    },
  };
});

// Mock pdfjs-dist/build/pdf.worker.mjs?url
vi.mock('pdfjs-dist/build/pdf.worker.mjs?url', () => {
  return {
    default: 'mock-worker-url',
  };
});

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => {
  const mockPage = {
    getTextContent: vi.fn().mockResolvedValue({
      items: [{ str: 'Mocked PDF Page Content' }],
    }),
  };
  const mockPdf = {
    numPages: 1,
    getPage: vi.fn().mockResolvedValue(mockPage),
  };
  return {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
    getDocument: vi.fn().mockReturnValue({
      promise: Promise.resolve(mockPdf),
    }),
  };
});
