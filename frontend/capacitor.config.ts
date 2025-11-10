import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diarium.app',
  appName: 'Diarium',
  webDir: 'dist',
  server: {
    // For development, use local server
    // url: 'http://localhost:5173',
    // cleartext: true,
    // For production, remove server config to use built files
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
