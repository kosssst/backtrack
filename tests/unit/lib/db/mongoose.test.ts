import { beforeEach, describe, expect, it, vi } from 'vitest';

const mongooseMocks = vi.hoisted(() => ({
  set: vi.fn(),
  connect: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('mongoose', () => ({
  default: {
    set: mongooseMocks.set,
    connect: mongooseMocks.connect,
  },
}));

vi.mock('@/lib/env', () => ({
  env: {
    MONGODB_URL: 'mongodb://localhost:27017/backtrack',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: mongooseMocks.debug,
  },
}));

describe('connectMongoose', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.mongooseCache = undefined;
    mongooseMocks.set.mockReset();
    mongooseMocks.connect.mockReset();
    mongooseMocks.debug.mockReset();
  });

  it('connects once and returns the cached connection afterwards', async () => {
    const connection = { name: 'conn' };
    mongooseMocks.connect.mockResolvedValue(connection);

    const { connectMongoose } = await import('@/lib/db/mongoose');

    await expect(connectMongoose()).resolves.toEqual(connection);
    await expect(connectMongoose()).resolves.toEqual(connection);

    expect(mongooseMocks.set).toHaveBeenCalledWith('strictQuery', true);
    expect(mongooseMocks.connect).toHaveBeenCalledTimes(1);
    expect(mongooseMocks.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/backtrack',
      { dbName: 'backtrack' },
    );
    expect(mongooseMocks.debug).toHaveBeenCalledWith('Mongoose connected');
  });

  it('clears the cached promise when the first connection attempt fails', async () => {
    mongooseMocks.connect
      .mockRejectedValueOnce(new Error('first failure'))
      .mockResolvedValueOnce({ name: 'second-conn' });

    const { connectMongoose } = await import('@/lib/db/mongoose');

    await expect(connectMongoose()).rejects.toThrow('first failure');
    await expect(connectMongoose()).resolves.toEqual({ name: 'second-conn' });
    expect(mongooseMocks.connect).toHaveBeenCalledTimes(2);
  });
});
