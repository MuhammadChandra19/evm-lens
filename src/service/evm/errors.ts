const ERRORS = {
  STOP: 'STOP',

  STACK_OVERFLOW: 'Stack Overflow',
  STACK_UNDERFLOW: 'Stack Underflow',
  INVALID_STACK_VALUE: 'Invalid Stack Value',

  INVALID_MEMORY_OFFSET: 'Invalid Memory Offset',
  INVALID_MEMORY_VALUE_SIZE: 'Invalid Memory Value Size',

  PROGRAM_COUNTER_OUT_OF_BOUNDS: 'Program Counter Out of Bounds',

  INVALID_JUMP_DESTINATION: 'Invalid Jump Destination',
  JUMP_OUT_OF_BOUNDS: 'Jump Out of Bounds',
} as const;

type ErrorKeyValue = (typeof ERRORS)[keyof typeof ERRORS];
export { ERRORS };
export type { ErrorKeyValue };
