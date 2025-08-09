import { ERRORS } from '../errors';
import Memory from './memory';

describe('Memory', () => {
  it('should create an empty memory', () => {
    const memory = new Memory();
    expect(memory.size).toBe(0);
  });

  describe('store', () => {
    it('should store a value in memory', () => {
      const memory = new Memory();
      memory.store(0, Buffer.from([0x01, 0x02, 0x03]), 3);
      expect(memory.size).toBe(3);
    });

    it('should throw an error if the offset is negative', () => {
      const memory = new Memory();
      expect(() => memory.store(-1, Buffer.from([0x01, 0x02, 0x03]), 3)).toThrow(ERRORS.INVALID_MEMORY_OFFSET);
    });

    it('should throw an error if the value length is not equal to the size', () => {
      const memory = new Memory();
      expect(() => memory.store(0, Buffer.from([0x01, 0x02, 0x03]), 2)).toThrow(ERRORS.INVALID_MEMORY_VALUE_SIZE);
    });

    it('should expand memory if the offset is greater than the current size', () => {
      const memory = new Memory();
      memory.store(0, Buffer.from([0x01, 0x02, 0x03]), 3);
      memory.store(4, Buffer.from([0x04, 0x05, 0x06]), 3);
      expect(memory.size).toBe(7);
      expect(memory.load(0, 7)).toEqual(Buffer.from([0x01, 0x02, 0x03, 0x00, 0x04, 0x05, 0x06]));
    });
  });

  describe('load', () => {
    it('should load a value from memory', () => {
      const memory = new Memory();
      memory.store(0, Buffer.from([0x01, 0x02, 0x03]), 3);
      expect(memory.load(0, 3)).toEqual(Buffer.from([0x01, 0x02, 0x03]));
    });

    it('should throw an error if the offset is negative', () => {
      const memory = new Memory();
      expect(() => memory.load(-1, 3)).toThrow(ERRORS.INVALID_MEMORY_OFFSET);
    });

    it('should return an empty buffer if the size is 0', () => {
      const memory = new Memory();
      expect(memory.load(0, 0)).toEqual(Buffer.alloc(0));
    });

    it('should return a buffer with the requested bytes', () => {
      const memory = new Memory();
      memory.store(0, Buffer.from([0x01, 0x02, 0x03]), 3);
      expect(memory.load(0, 3)).toEqual(Buffer.from([0x01, 0x02, 0x03]));
    });
  });
});
