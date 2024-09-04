import { BuildError } from 'exceptions'

import type { ICommand } from './ICommand'
import type { IcType } from './Types'

type WriteResult = undefined

export class WriteCommand implements ICommand<WriteResult, [number, Uint8Array]> {
  timeoutMs = 10

  pageByteSize = 4 as const

  userMemoryStartPage = 0x04 as const

  userMemoryEndPage: 0x27 | 0x81 | 0xe1

  private icType: IcType

  constructor(icType: IcType) {
    this.icType = icType
    this.userMemoryEndPage = this.getUserMemoryEndPage()
  }

  build = (page: number, data: Uint8Array) => {
    if (data.length !== this.pageByteSize) {
      throw new BuildError('Invalid data length', {
        dataLength: data.length,
        expectedLength: this.pageByteSize,
      })
    }
    this.validatePage(page)

    return new Uint8Array([0xa2, page, ...data])
  }

  // eslint-disable-next-line class-methods-use-this
  parse = (response: Uint8Array) => ({
    parsed: undefined,
    raw: response,
  })

  private getUserMemoryEndPage = () => {
    switch (this.icType) {
      case 'NTAG213':
        return 0x27
      case 'NTAG215':
        return 0x81
      case 'NTAG216':
        return 0xe1
      default:
        throw new BuildError('Unknown IC type', {
          icType: this.icType,
        })
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

  private validatePage = (page: number) => {
    const minPage = 0x02
    const maxPage = this.getMaxPage()

    if (page < minPage || page > maxPage) {
      throw new BuildError('Invalid page', {
        page,
        maxPage,
      })
    }
  }
}
