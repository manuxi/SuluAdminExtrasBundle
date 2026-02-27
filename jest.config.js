module.exports = {
    moduleNameMapper: {
        '\\.(scss|css)$': 'identity-obj-proxy',
        '\\.svg$': '<rootDir>/tests/js/mocks/svg.js',
    },
    moduleDirectories: [
        'node_modules',
        'src/Resources/js',
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/src/Resources/package.json',
        '<rootDir>/vendor/',
    ],
    setupFiles: [
        'jest-canvas-mock',
        'regenerator-runtime/runtime',
    ],
    setupFilesAfterEnv: [
        './tests/js/testSetup.config.js',
    ],
    snapshotSerializers: [
        'enzyme-to-json/serializer',
    ],
    clearMocks: true,
    testMatch: [
        '<rootDir>/tests/js/**/*.test.js',
        '<rootDir>/src/Resources/js/**/tests/**/*.test.js',
    ],
    testURL: 'http://localhost',
    transformIgnorePatterns: [
        'node_modules/(?!(sulu-admin-bundle)/)',
    ],
};
