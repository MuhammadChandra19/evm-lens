import { ERRORS } from '../errors';
import Stack from './stack';

describe('Stack', () => {
  describe('push', () => {
    it('should push a value to the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(stack.stack).toEqual([1n]);
    });

    it('should throw an error if the value is negative', () => {
      const stack = new Stack();
      expect(() => stack.push(-1n)).toThrow(ERRORS.INVALID_STACK_VALUE);
    });

    it('should throw an error if the value is greater than the maximum 256-bit word', () => {
      const stack = new Stack();
      expect(() => stack.push(4n ** 255n)).toThrow(ERRORS.INVALID_STACK_VALUE);
    });

    it('should throw an error if the stack would exceed the maximum depth', () => {
      const stack = new Stack();
      for (let i = 0; i < 1024; i++) {
        stack.push(BigInt(i));
      }
      expect(() => stack.push(1n)).toThrow(ERRORS.STACK_OVERFLOW);
    });
  });

  describe('pop', () => {
    it('should pop a value from the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(stack.pop()).toEqual(1n);
    });

    it('should throw an error if the stack is empty', () => {
      const stack = new Stack();
      expect(() => stack.pop()).toThrow(ERRORS.STACK_UNDERFLOW);
    });
  });

  describe('popN', () => {
    it('should pop a value from the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(stack.popN(1)).toEqual([1n]);
    });

    it('should throw an error if the stack is empty', () => {
      const stack = new Stack();
      expect(() => stack.popN(1)).toThrow(ERRORS.STACK_UNDERFLOW);
    });

    it('should throw an error if the stack does not have enough values', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(() => stack.popN(2)).toThrow(ERRORS.STACK_UNDERFLOW);
    });

    it('should pop multiple values from the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      stack.push(2n);
      expect(stack.popN(2)).toEqual([2n, 1n]);
    });
  });

  describe('peek', () => {
    it('should peek a value from the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(stack.peek(1)).toEqual(1n);
    });

    it('should throw an error if the stack is empty', () => {
      const stack = new Stack();
      expect(() => stack.peek(1)).toThrow(ERRORS.STACK_UNDERFLOW);
    });
  });

  describe('swap', () => {
    it('should swap the top two values on the stack', () => {
      const stack = new Stack();
      stack.push(1n);
      stack.push(2n);
      stack.swap(1);
      expect(stack.stack).toEqual([2n, 1n]);
    });

    it('should throw an error if the stack does not have enough values', () => {
      const stack = new Stack();
      stack.push(1n);
      expect(() => stack.swap(2)).toThrow(ERRORS.STACK_UNDERFLOW);
    });
  });
});
