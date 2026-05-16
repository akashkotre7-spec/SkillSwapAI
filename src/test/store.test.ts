import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../lib/store.ts';

describe('Store', () => {
  beforeEach(() => {
    useStore.getState().setUser(null);
  });

  it('should update user state', () => {
    const mockUser = {
      userId: '123',
      name: 'Test User',
      email: 'test@example.com',
      teaches: [],
      learns: [],
      points: 100,
      xp: 0,
      level: 1,
      role: 'user' as const,
      onboarded: false,
      createdAt: new Date(),
    };

    useStore.getState().setUser(mockUser);
    expect(useStore.getState().user?.name).toBe('Test User');
  });

  it('should clear user state', () => {
    useStore.getState().setUser(null);
    expect(useStore.getState().user).toBe(null);
  });
});
