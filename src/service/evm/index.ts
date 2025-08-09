export default class EVM {
  run(code: Uint8Array) {
    let pc = 0;
    const stack: bigint[] = [];

    while (pc < code.length) {
      const opcode = code[pc];
      pc++;
      switch (opcode) {
        case 0x00:
          // STOP
          stack.push(0n);
          break;
        case 0x01:
          // ADD

          break;
        case 0x02:
        // MUL
      }
    }

    return {
      stack,
      pc,
    };
  }
}
