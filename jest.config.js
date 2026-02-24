module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(spec|test).js',
    '**/?(*.)+(spec|test).js'
  ],
};