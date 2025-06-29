import '@testing-library/jest-dom';
import { TextEncoder } from 'util';

// Mock for nanoid
jest.mock( 'nanoid', () => ( {
  nanoid: () => 'mock-id-' + Math.random().toString( 36 ).substr( 2, 9 )
} ) );

// Global polyfills
global.TextEncoder = TextEncoder;

// Mock HTMLCanvasElement for Konva tests
HTMLCanvasElement.prototype.getContext = jest.fn();