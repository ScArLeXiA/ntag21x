export class ParseError extends Error {
  raw: Uint8Array

  constructor(message: string, raw: Uint8Array) {
    super(message)
    this.raw = raw
  }
}
