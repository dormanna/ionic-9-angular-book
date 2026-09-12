import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.dormann.bobtours',
  appName: 'BoB Tours',
  webDir: 'www',
  // The web view's own ground, behind the app and before it
  // has drawn anything. Same value as --ion-background-color.
  backgroundColor: '#f7f6f2'
};

export default config;
