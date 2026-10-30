import { createClient } from '@insforge/sdk';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_INSFORGE_URL || 'http://localhost:3000';
}

const baseUrl = getBaseUrl();
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_2953fab02c96dcca63940dfc6ea1f77b';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
