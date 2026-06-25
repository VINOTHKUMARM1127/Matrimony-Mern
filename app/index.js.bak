// Polyfill __DEV__ for web
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = process.env.NODE_ENV !== 'production';
}

// Polyfill DOMParser for React Native (Hermes). The AWS S3 SDK used for
// Cloudflare R2 uploads parses XML responses with DOMParser, which Hermes
// does not provide — without this, photo uploads throw
// "ReferenceError: Property 'DOMParser' doesn't exist".
import { DOMParser as XmlDomParser } from '@xmldom/xmldom';
if (typeof global.DOMParser === 'undefined') {
  global.DOMParser = XmlDomParser;
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
