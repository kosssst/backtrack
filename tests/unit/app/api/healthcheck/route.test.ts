import { GET, runtime } from '@/app/api/healthcheck/route';
import { describe, expect, it } from 'vitest';

describe('GET /api/healthcheck', () => {
  it('uses the node runtime', () => {
    expect(runtime).toBe('nodejs');
  });

  it('returns ok=true and a numeric timestamp', async () => {
    const response = await GET();
    const json = await response.json();

    expect(json.ok).toBe(true);
    expect(typeof json.ts).toBe('number');
  });
});
