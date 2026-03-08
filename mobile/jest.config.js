module.exports = {
  preset: 'jest-expo',
  cacheDirectory: '/tmp/jest-cache',
  maxWorkers: 1,

  // Setup files
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/navigation/**',
    '!src/model/schema.ts',
    '!src/model/index.ts',
    '!src/model/seedDevData.ts',
    '!src/model/migrations.ts',
  ],

  // Module name mapper for static assets and mocks
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    // Mock ThemeContext pour éviter la dépendance transitoire → database → SQLiteAdapter
    '.*\\/contexts\\/ThemeContext': '<rootDir>/__mocks__/ThemeContextMock.ts',
    // Mock LanguageContext pour éviter la dépendance transitoire → database → SQLiteAdapter
    '.*\\/contexts\\/LanguageContext': '<rootDir>/__mocks__/LanguageContextMock.ts',
    // Mock @expo/vector-icons pour éviter loadedNativeFonts en environnement Jest
    '@expo/vector-icons': '<rootDir>/__mocks__/vectorIconsMock.js',
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@nozbe/watermelondb|@gorhom/portal)',
  ],
}