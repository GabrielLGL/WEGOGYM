module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@nozbe/watermelondb/babel/plugin'],
      'react-native-reanimated/plugin',
    ],
  }
}
