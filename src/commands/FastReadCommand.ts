import { BuildError, ParseError } from 'exceptions'

import type { ICommand } from './ICommand'
import type { IcType } from './Types'

export class FastReadCommand implements ICommand<Uint8Array, [number, number]> {
  timeoutMs = 5

  pageByteSize = 4 as const

  private icType: IcType

  private expectedResponseLength: number | undefined

  constructor(icType: IcType) {
    this.icType = icType
  }

  build = (startPage: number, endPage: number) => {
    this.validatePage(startPage, endPage)
    this.expectedResponseLength = (endPage - startPage + 1) * this.pageByteSize

    return new Uint8Array([0x3a, startPage, endPage])
  }

  parse = (response: Uint8Array) => {
    if (this.expectedResponseLength === undefined) {
      throw new ParseError('Expected response length is not set, build method must be called first', response)
    }
    if (response.length !== this.expectedResponseLength) {
      throw new ParseError('Invalid response length', response)
    }

    return {
      parsed: response,
      raw: response,
    }
  }

  private getMaxPage = () => {
    switch (this.icType) {
      case 'NTAG213':
        return 0x2c
      case 'NTAG215':
        return 0x86
      case 'NTAG216':
        return 0xe6
      default:
        throw new BuildError('Unknown IC type', {
          icType: this.icType,
        })
    }
  }

  private validatePage = (startPage: number, endPage: number) => {
    const minPage = 0x00
    const maxPage = this.getMaxPage()

    if (startPage < minPage || endPage < minPage || startPage > maxPage || endPage > maxPage || startPage > endPage) {
      throw new BuildError('Invalid page range', {
        startPage,
        endPage,
        maxPage,
      })
    }
  }
}
