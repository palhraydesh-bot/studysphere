import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studysphere.app',
  appName: 'StudySphere',

  server: {
    url: 'https://studyspherebyshubh-main.vercel.app',
    cleartext: true
  }
};

export default config;