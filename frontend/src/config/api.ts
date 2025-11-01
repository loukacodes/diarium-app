/**
 * API Configuration
 * Handles different API endpoints for development and production
 */

const getApiBaseUrl = (): string => {
  // Get API URL from environment variable (Vite uses import.meta.env)
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If environment variable is set, use it (highest priority)
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Check if we're running in a Capacitor app
  const isCapacitor = (window as any).Capacitor !== undefined;
  
  if (isCapacitor) {
    // Detect Android platform
    const platform = (window as any).Capacitor?.getPlatform();
    
    if (platform === 'android') {
      // Android emulator uses special IP to access host machine
      // 10.0.2.2 is the special IP that maps to host machine's localhost
      return 'http://10.0.2.2:3000';
    } else if (platform === 'ios') {
      // iOS Simulator can use localhost directly
      return 'http://localhost:3000';
    } else {
      // For physical devices, use localhost (but should set VITE_API_URL)
      // For production, this should be your deployed backend URL
      return 'http://localhost:3000';
    }
  }
  
  // In web browser (development), use localhost
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Is Capacitor:', (window as any).Capacitor !== undefined);
  if ((window as any).Capacitor) {
    console.log('🔧 Platform:', (window as any).Capacitor?.getPlatform());
  }
}

export default API_BASE_URL;

