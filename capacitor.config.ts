import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dluz.elitevelocity',
  appName: 'Elite Velocity',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'elite-velocity-v2-dluz.web.app',
    allowNavigation: [
      "elite-velocity-v2-dluz.firebaseapp.com",
      "*.firebaseapp.com"
    ]
  }
};

export default config;
