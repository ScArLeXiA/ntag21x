import type { JsonObject } from 'type-fest'

export class BuildError extends Error {
  vars: JsonObject

  constructor(message: string, vars: JsonObject = {}) {
    super(message)
    this.vars = vars
  }
}
