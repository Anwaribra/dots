/**
 * Application environment configuration.
 * Configures API endpoints and adapter mode without leaking secrets.
 */

export const env = {
  isProduction: import.meta.env.PROD,
  apiUrl: (import.meta.env.VITE_DOTS_API_URL as string) || '',
  useFixtures: !import.meta.env.VITE_DOTS_API_URL,
  waitlistEndpoint: (import.meta.env.VITE_WAITLIST_ENDPOINT as string) || '',
};
