export type ICommand<ParsedResult, BuildArgs extends unknown[] = []> = {
  timeoutMs: number

  build(...args: BuildArgs): Uint8Array
  parse(response: Uint8Array): {
    parsed: ParsedResult
    raw: Uint8Array
  }
}
