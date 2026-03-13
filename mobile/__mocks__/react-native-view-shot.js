const React = require('react')
const { View } = require('react-native')

const ViewShot = React.forwardRef(function ViewShot(_props, ref) {
  React.useImperativeHandle(ref, () => ({
    capture: jest.fn().mockResolvedValue('/tmp/mock-capture.png'),
  }))
  // Do not render children to avoid duplicate text in tests
  return React.createElement(View)
})

ViewShot.displayName = 'ViewShot'

module.exports = ViewShot
module.exports.default = ViewShot
