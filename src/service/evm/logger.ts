import fs from "fs"
import path from "path"

import runners from "./opcodes/runners"

import type { MachineState } from "./machine-state/types"
import { parsers } from "./opcodes/utils"

export default class Logger {
  private _output: string[]
  private _steps: number

  /**
   * Initializes a new logger instance for EVM execution tracking
   */
  constructor() {
    this._steps = 0
    this._output = []
  }

  /**
   * Logs the start of execution with bytecode and optional assembly
   * @param bin - Bytecode as Uint8Array
   * @param asm - Optional assembly code string
   */
  start(bin: Uint8Array, asm?: string) {
    this._output.push(`******************** Starting Execution ********************`)
    this._output.push(``)
    this._output.push(`Execution Bytecode:`)
    this._output.push(`${Buffer.from(bin).toString("hex")}`)
    this._output.push(``)

    if (asm) {
      this._output.push(`Execution ASM:`)
      this._output.push(asm)
      this._output.push(``)
    }

    this._output.push(`Starting execution...`)
    this._output.push(``)
  }

  /**
   * Logs a single execution step with complete machine state
   * @param ms - Current machine state including stack, memory, storage, etc.
   */
  step(ms: MachineState) {
    this._output.push(`******************** Step ${this._steps++} ********************`)
    this._output.push(`Opcode: ${runners[ms.code[ms.pc]].name}`)
    this._output.push(`Program Counter: ${ms.pc}`)
    this._output.push(``)
    this._output.push(`Stack:`)
    this._output.push(`${ms.stack.dump.map(parsers.BigintIntoHexString).join("\n")}`)
    this._output.push(``)
    this._output.push(`Memory:`)
    this._output.push(`${ms.memory.dump || "Empty"}`)
    this._output.push(``)
    this._output.push(`Storage:`)
    this._output.push(`${ms.storage.dump || "Empty"}`)
    this._output.push(``)
    this._output.push(`Return data:`)
    this._output.push(`${ms.returnData.toString("hex") || "Empty"}`)
    this._output.push(``)
    this._output.push(`Logs:`)
    this._output.push(`${ms.logs || "Empty"}`)
    this._output.push(``)
  }

  /**
   * Logs an error that occurred during execution
   * @param err - Error message or object
   */
  error(err: string) {
    this._output.push(`******************** ERROR ********************`)
    this._output.push(``)
    this._output.push(`Runtime Error encountered: ${err}`)
    this._output.push(``)
  }

  /**
   * Logs a notification message (e.g., subcall start/end)
   * @param message - Notification message to log
   */
  notify(message: string) {
    this._output.push(`******************** NOTIFICATION ********************`)
    this._output.push(``)
    this._output.push(`${message}`)
    this._output.push(``)
  }

  /**
   * Gets the complete log output as a formatted string
   * @returns All logged messages joined with newlines
   */
  get output() {
    return this._output.join("\n")
  }

  /**
   * Saves the log output to a file in the logs directory
   * @param filename - Optional custom filename (defaults to timestamp-based name)
   * @returns Path to the saved file, or empty string if save failed
   */
  saveToFile(filename?: string): string {
    try {
      if (!filename) filename = `execution-${Date.now()}`

      if (!fs.existsSync(path.join(__dirname, "../logs")))
        fs.mkdirSync(path.join(__dirname, "../logs"))

      const filepath = path.join(__dirname, `../logs/${filename}.log`)
      fs.writeFileSync(filepath, this.output)
      return filepath
    } catch (err) {
      console.error("Error while saving logs to file: ", err)
      return ""
    }
  }
}
