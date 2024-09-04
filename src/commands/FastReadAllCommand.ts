import { BuildError, ParseError } from 'exceptions'

import type { ICommand } from './ICommand'
import type { IcType } from './Types'
import type { FixedLengthUint8, FixedLengthUint8Array } from 'utils'

type MemoryMap = {
  manufacturer: {
    serialNumberWithBcc: Uint8Array
    internal: Uint8Array
  }
  lock: {
    static: Uint8Array
    dynamic: Uint8Array
  }
  capabilityContainer: Uint8Array
  userMemory: Uint8Array
  configration: Uint8Array
}

type FastReadAllResult = {
  serialNumber: Uint8Array
  lock: {
    static: Uint8Array
    dynamic: Uint8Array
  }
  capabilityContainer: Uint8Array
  userMemory: Uint8Array
  configration: Uint8Array
}

export class FastReadAllCommand implements ICommand<FastReadAllResult> {
  timeoutMs = 5

  pageByteSize = 4 as const

  private icType: IcType

  constructor(icType: IcType) {
    this.icType = icType
  }

  build = () => {
    const startPage = 0x00
    const endPage = this.getMaxPage()
    this.validatePage(startPage, endPage)

    return new Uint8Array([0x3a, startPage, endPage])
  }

  parse = (response: Uint8Array) => {
    const expectedLength = this.getExpectedResponseLength()
    if (response.length !== expectedLength) {
      throw new ParseError('Invalid response length', response)
    }

    const memoryMap = this.parseMemory(response)

    const parsedResult: FastReadAllResult = {
      serialNumber: this.parseSerialNumber(memoryMap.manufacturer.serialNumberWithBcc),
      lock: {
        static: memoryMap.lock.static,
        dynamic: memoryMap.lock.dynamic,
      },
      capabilityContainer: memoryMap.capabilityContainer,
      userMemory: memoryMap.userMemory,
      configration: memoryMap.configration,
    }

    return {
      parsed: parsedResult,
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

  private getExpectedResponseLength = () => {
    const maxPage = this.getMaxPage()

    return (maxPage + 1) * this.pageByteSize
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

  private parseMemory = (response: Uint8Array): MemoryMap => {
    const pages: Uint8Array[] = []
    for (let i = 0; i < response.length; i += this.pageByteSize) {
      const page = response.slice(i, i + this.pageByteSize)
      pages.push(page)
    }

    switch (this.icType) {
      case 'NTAG213':
        return this.parseNtag213Memory(pages as FixedLengthUint8Array<0x2d>)
      case 'NTAG215':
        return this.parseNtag215Memory(pages as FixedLengthUint8Array<0x87>)
      case 'NTAG216':
        return this.parseNtag216Memory(pages as FixedLengthUint8Array<0xe7>)
      default:
        throw new ParseError('Unknown IC type', response)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private parseNtag213Memory = (pages: FixedLengthUint8Array<0x2d>): MemoryMap => {
    const memoryMap: MemoryMap = {
      manufacturer: {
        serialNumberWithBcc: new Uint8Array([...pages[0x00], ...pages[0x01], ...pages[0x02].slice(0, 1)]),
        internal: new Uint8Array([...pages[0x02].slice(1, 2)]),
      },
      lock: {
        static: new Uint8Array([...pages[0x02].slice(2, 4)]),
        dynamic: new Uint8Array([...pages[0x28].slice(0, 4)]),
      },
      capabilityContainer: new Uint8Array([...pages[0x03]]),
      userMemory: new Uint8Array([
        ...pages[0x04],
        ...pages[0x05],
        ...pages[0x06],
        ...pages[0x07],
        ...pages[0x08],
        ...pages[0x09],
        ...pages[0x0a],
        ...pages[0x0b],
        ...pages[0x0c],
        ...pages[0x0d],
        ...pages[0x0e],
        ...pages[0x0f],
        ...pages[0x10],
        ...pages[0x11],
        ...pages[0x12],
        ...pages[0x13],
        ...pages[0x14],
        ...pages[0x15],
        ...pages[0x16],
        ...pages[0x17],
        ...pages[0x18],
        ...pages[0x19],
        ...pages[0x1a],
        ...pages[0x1b],
        ...pages[0x1c],
        ...pages[0x1d],
        ...pages[0x1e],
        ...pages[0x1f],
        ...pages[0x20],
        ...pages[0x21],
        ...pages[0x22],
        ...pages[0x23],
        ...pages[0x24],
        ...pages[0x25],
        ...pages[0x26],
        ...pages[0x27],
      ]),
      configration: new Uint8Array([...pages[0x29], ...pages[0x2a], ...pages[0x2b], ...pages[0x2c].slice(0, 3)]),
    }

    return memoryMap
  }

  // eslint-disable-next-line class-methods-use-this
  private parseNtag215Memory = (pages: FixedLengthUint8Array<0x87>): MemoryMap => {
    const memoryMap: MemoryMap = {
      manufacturer: {
        serialNumberWithBcc: new Uint8Array([...pages[0x00], ...pages[0x01], ...pages[0x02].slice(0, 1)]),
        internal: new Uint8Array([...pages[0x02].slice(1, 2)]),
      },
      lock: {
        static: new Uint8Array([...pages[0x02].slice(2, 4)]),
        dynamic: new Uint8Array([...pages[0x82].slice(0, 4)]),
      },
      capabilityContainer: new Uint8Array([...pages[0x03]]),
      userMemory: new Uint8Array([
        ...pages[0x04],
        ...pages[0x05],
        ...pages[0x06],
        ...pages[0x07],
        ...pages[0x08],
        ...pages[0x09],
        ...pages[0x0a],
        ...pages[0x0b],
        ...pages[0x0c],
        ...pages[0x0d],
        ...pages[0x0e],
        ...pages[0x0f],
        ...pages[0x10],
        ...pages[0x11],
        ...pages[0x12],
        ...pages[0x13],
        ...pages[0x14],
        ...pages[0x15],
        ...pages[0x16],
        ...pages[0x17],
        ...pages[0x18],
        ...pages[0x19],
        ...pages[0x1a],
        ...pages[0x1b],
        ...pages[0x1c],
        ...pages[0x1d],
        ...pages[0x1e],
        ...pages[0x1f],
        ...pages[0x20],
        ...pages[0x21],
        ...pages[0x22],
        ...pages[0x23],
        ...pages[0x24],
        ...pages[0x25],
        ...pages[0x26],
        ...pages[0x27],
        ...pages[0x28],
        ...pages[0x29],
        ...pages[0x2a],
        ...pages[0x2b],
        ...pages[0x2c],
        ...pages[0x2d],
        ...pages[0x2e],
        ...pages[0x2f],
        ...pages[0x30],
        ...pages[0x31],
        ...pages[0x32],
        ...pages[0x33],
        ...pages[0x34],
        ...pages[0x35],
        ...pages[0x36],
        ...pages[0x37],
        ...pages[0x38],
        ...pages[0x39],
        ...pages[0x3a],
        ...pages[0x3b],
        ...pages[0x3c],
        ...pages[0x3d],
        ...pages[0x3e],
        ...pages[0x3f],
        ...pages[0x40],
        ...pages[0x41],
        ...pages[0x42],
        ...pages[0x43],
        ...pages[0x44],
        ...pages[0x45],
        ...pages[0x46],
        ...pages[0x47],
        ...pages[0x48],
        ...pages[0x49],
        ...pages[0x4a],
        ...pages[0x4b],
        ...pages[0x4c],
        ...pages[0x4d],
        ...pages[0x4e],
        ...pages[0x4f],
        ...pages[0x50],
        ...pages[0x51],
        ...pages[0x52],
        ...pages[0x53],
        ...pages[0x54],
        ...pages[0x55],
        ...pages[0x56],
        ...pages[0x57],
        ...pages[0x58],
        ...pages[0x59],
        ...pages[0x5a],
        ...pages[0x5b],
        ...pages[0x5c],
        ...pages[0x5d],
        ...pages[0x5e],
        ...pages[0x5f],
        ...pages[0x60],
        ...pages[0x61],
        ...pages[0x62],
        ...pages[0x63],
        ...pages[0x64],
        ...pages[0x65],
        ...pages[0x66],
        ...pages[0x67],
        ...pages[0x68],
        ...pages[0x69],
        ...pages[0x6a],
        ...pages[0x6b],
        ...pages[0x6c],
        ...pages[0x6d],
        ...pages[0x6e],
        ...pages[0x6f],
        ...pages[0x70],
        ...pages[0x71],
        ...pages[0x72],
        ...pages[0x73],
        ...pages[0x74],
        ...pages[0x75],
        ...pages[0x76],
        ...pages[0x77],
        ...pages[0x78],
        ...pages[0x79],
        ...pages[0x7a],
        ...pages[0x7b],
        ...pages[0x7c],
        ...pages[0x7d],
        ...pages[0x7e],
        ...pages[0x7f],
        ...pages[0x80],
        ...pages[0x81],
      ]),
      configration: new Uint8Array([...pages[0x83], ...pages[0x84], ...pages[0x85], ...pages[0x86].slice(0, 3)]),
    }

    return memoryMap
  }

  // eslint-disable-next-line class-methods-use-this
  private parseNtag216Memory = (pages: FixedLengthUint8Array<0xe7>): MemoryMap => {
    const memoryMap: MemoryMap = {
      manufacturer: {
        serialNumberWithBcc: new Uint8Array([...pages[0x00], ...pages[0x01], ...pages[0x02].slice(0, 1)]),
        internal: new Uint8Array([...pages[0x02].slice(1, 2)]),
      },
      lock: {
        static: new Uint8Array([...pages[0x02].slice(2, 4)]),
        dynamic: new Uint8Array([...pages[0xe2].slice(0, 4)]),
      },
      capabilityContainer: new Uint8Array([...pages[0x03]]),
      userMemory: new Uint8Array([
        ...pages[0x04],
        ...pages[0x05],
        ...pages[0x06],
        ...pages[0x07],
        ...pages[0x08],
        ...pages[0x09],
        ...pages[0x0a],
        ...pages[0x0b],
        ...pages[0x0c],
        ...pages[0x0d],
        ...pages[0x0e],
        ...pages[0x0f],
        ...pages[0x10],
        ...pages[0x11],
        ...pages[0x12],
        ...pages[0x13],
        ...pages[0x14],
        ...pages[0x15],
        ...pages[0x16],
        ...pages[0x17],
        ...pages[0x18],
        ...pages[0x19],
        ...pages[0x1a],
        ...pages[0x1b],
        ...pages[0x1c],
        ...pages[0x1d],
        ...pages[0x1e],
        ...pages[0x1f],
        ...pages[0x20],
        ...pages[0x21],
        ...pages[0x22],
        ...pages[0x23],
        ...pages[0x24],
        ...pages[0x25],
        ...pages[0x26],
        ...pages[0x27],
        ...pages[0x28],
        ...pages[0x29],
        ...pages[0x2a],
        ...pages[0x2b],
        ...pages[0x2c],
        ...pages[0x2d],
        ...pages[0x2e],
        ...pages[0x2f],
        ...pages[0x30],
        ...pages[0x31],
        ...pages[0x32],
        ...pages[0x33],
        ...pages[0x34],
        ...pages[0x35],
        ...pages[0x36],
        ...pages[0x37],
        ...pages[0x38],
        ...pages[0x39],
        ...pages[0x3a],
        ...pages[0x3b],
        ...pages[0x3c],
        ...pages[0x3d],
        ...pages[0x3e],
        ...pages[0x3f],
        ...pages[0x40],
        ...pages[0x41],
        ...pages[0x42],
        ...pages[0x43],
        ...pages[0x44],
        ...pages[0x45],
        ...pages[0x46],
        ...pages[0x47],
        ...pages[0x48],
        ...pages[0x49],
        ...pages[0x4a],
        ...pages[0x4b],
        ...pages[0x4c],
        ...pages[0x4d],
        ...pages[0x4e],
        ...pages[0x4f],
        ...pages[0x50],
        ...pages[0x51],
        ...pages[0x52],
        ...pages[0x53],
        ...pages[0x54],
        ...pages[0x55],
        ...pages[0x56],
        ...pages[0x57],
        ...pages[0x58],
        ...pages[0x59],
        ...pages[0x5a],
        ...pages[0x5b],
        ...pages[0x5c],
        ...pages[0x5d],
        ...pages[0x5e],
        ...pages[0x5f],
        ...pages[0x60],
        ...pages[0x61],
        ...pages[0x62],
        ...pages[0x63],
        ...pages[0x64],
        ...pages[0x65],
        ...pages[0x66],
        ...pages[0x67],
        ...pages[0x68],
        ...pages[0x69],
        ...pages[0x6a],
        ...pages[0x6b],
        ...pages[0x6c],
        ...pages[0x6d],
        ...pages[0x6e],
        ...pages[0x6f],
        ...pages[0x70],
        ...pages[0x71],
        ...pages[0x72],
        ...pages[0x73],
        ...pages[0x74],
        ...pages[0x75],
        ...pages[0x76],
        ...pages[0x77],
        ...pages[0x78],
        ...pages[0x79],
        ...pages[0x7a],
        ...pages[0x7b],
        ...pages[0x7c],
        ...pages[0x7d],
        ...pages[0x7e],
        ...pages[0x7f],
        ...pages[0x80],
        ...pages[0x81],
        ...pages[0x82],
        ...pages[0x83],
        ...pages[0x84],
        ...pages[0x85],
        ...pages[0x86],
        ...pages[0x87],
        ...pages[0x88],
        ...pages[0x89],
        ...pages[0x8a],
        ...pages[0x8b],
        ...pages[0x8c],
        ...pages[0x8d],
        ...pages[0x8e],
        ...pages[0x8f],
        ...pages[0x90],
        ...pages[0x91],
        ...pages[0x92],
        ...pages[0x93],
        ...pages[0x94],
        ...pages[0x95],
        ...pages[0x96],
        ...pages[0x97],
        ...pages[0x98],
        ...pages[0x99],
        ...pages[0x9a],
        ...pages[0x9b],
        ...pages[0x9c],
        ...pages[0x9d],
        ...pages[0x9e],
        ...pages[0x9f],
        ...pages[0xa0],
        ...pages[0xa1],
        ...pages[0xa2],
        ...pages[0xa3],
        ...pages[0xa4],
        ...pages[0xa5],
        ...pages[0xa6],
        ...pages[0xa7],
        ...pages[0xa8],
        ...pages[0xa9],
        ...pages[0xaa],
        ...pages[0xab],
        ...pages[0xac],
        ...pages[0xad],
        ...pages[0xae],
        ...pages[0xaf],
        ...pages[0xb0],
        ...pages[0xb1],
        ...pages[0xb2],
        ...pages[0xb3],
        ...pages[0xb4],
        ...pages[0xb5],
        ...pages[0xb6],
        ...pages[0xb7],
        ...pages[0xb8],
        ...pages[0xb9],
        ...pages[0xba],
        ...pages[0xbb],
        ...pages[0xbc],
        ...pages[0xbd],
        ...pages[0xbe],
        ...pages[0xbf],
        ...pages[0xc0],
        ...pages[0xc1],
        ...pages[0xc2],
        ...pages[0xc3],
        ...pages[0xc4],
        ...pages[0xc5],
        ...pages[0xc6],
        ...pages[0xc7],
        ...pages[0xc8],
        ...pages[0xc9],
        ...pages[0xca],
        ...pages[0xcb],
        ...pages[0xcc],
        ...pages[0xcd],
        ...pages[0xce],
        ...pages[0xcf],
        ...pages[0xd0],
        ...pages[0xd1],
        ...pages[0xd2],
        ...pages[0xd3],
        ...pages[0xd4],
        ...pages[0xd5],
        ...pages[0xd6],
        ...pages[0xd7],
        ...pages[0xd8],
        ...pages[0xd9],
        ...pages[0xda],
        ...pages[0xdb],
        ...pages[0xdc],
        ...pages[0xdd],
        ...pages[0xde],
        ...pages[0xdf],
        ...pages[0xe0],
        ...pages[0xe1],
      ]),
      configration: new Uint8Array([...pages[0xe3], ...pages[0xe4], ...pages[0xe5], ...pages[0xe6].slice(0, 3)]),
    }

    return memoryMap
  }

  // eslint-disable-next-line class-methods-use-this
  private parseSerialNumber = (data: Uint8Array): FastReadAllResult['serialNumber'] => {
    if (data.length !== 9) {
      throw new ParseError('Invalid serial number length', data)
    }

    const [sn0, sn1, sn2, bcc0, sn3, sn4, sn5, sn6, bcc1] = data as unknown as FixedLengthUint8<9>

    // eslint-disable-next-line no-bitwise
    const expectedBcc0 = sn0 ^ sn1 ^ sn2 ^ 0x88
    if (bcc0 !== expectedBcc0) {
      throw new ParseError('Failed to verify BCC0 for serial number', data)
    }

    // eslint-disable-next-line no-bitwise
    const expectedBcc1 = sn3 ^ sn4 ^ sn5 ^ sn6
    if (bcc1 !== expectedBcc1) {
      throw new ParseError('Failed to verify BCC1 for serial number', data)
    }

    return new Uint8Array([sn0, sn1, sn2, sn3, sn4, sn5, sn6])
  }
}
