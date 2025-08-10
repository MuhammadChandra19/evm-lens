import { parsers } from "../utils";

import type { MachineState } from "../../machine-state/types";

/**
 * LOG opcodes (0xa0-0xa4): Emit log events with 0-4 topics
 * Number of topics determined by (opcode - 0xa0)
 * Pops memory offset, size, and N topics from stack
 * @param ms - Machine state
 */
export function LOG(ms: MachineState) {
  const n = ms.code[ms.pc] - 0xa0;
  const [memOffset, size] = ms.stack.popN(2);
  const topics = ms.stack.popN(n);

  const data = ms.memory.read(Number(memOffset), Number(size));
  const topicsHex = topics.map(parsers.BigintIntoHexString);

  ms.logs.push({
    address: ms.txData.to,
    data: data.toString("hex"),
    topics: topicsHex,
  });
}
