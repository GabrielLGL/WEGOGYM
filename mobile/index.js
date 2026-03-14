import { registerRootComponent } from 'expo'
import App from './App'

// react-native-android-widget requires a native build (custom dev client or production).
// Guard prevents crash when running without the native module (Expo Go / standard build).
try {
  const { registerWidgetTaskHandler } = require('react-native-android-widget')
  const { widgetTaskHandler } = require('./src/widgets/KoreWidgetTaskHandler')
  registerWidgetTaskHandler(widgetTaskHandler)
} catch (_e) {
  // Native module not available in this build — widget disabled
}

registerRootComponent(App)
