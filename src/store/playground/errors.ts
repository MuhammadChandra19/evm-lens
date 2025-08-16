const ERRORS = {
  EVM_NOT_INITIALIZED: "EVM not initialized",
} as const;

export type ErrorPlayground = (typeof ERRORS)[keyof typeof ERRORS];

export { ERRORS };
