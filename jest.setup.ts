import '@testing-library/jest-dom';

global.crypto = {
  ...global.crypto,
  randomUUID: () => Math.random().toString(36).substring(2) as `${string}-${string}-${string}-${string}-${string}`,
};

global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1, setTargetAtTime: jest.fn() },
  }),
  destination: {},
  currentTime: 0,
}));
