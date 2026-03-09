const React = require('react')
const { View } = require('react-native')

const Ionicons = ({ name, size: _size, color: _color, ...props }) =>
  React.createElement(View, { testID: `icon-${name}`, ...props })

module.exports = { Ionicons }
