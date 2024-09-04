import { ParseError } from 'exceptions'

import type { ICommand } from './ICommand'
import type { IcType } from './Types'
import type { FixedLengthUint8 } from 'utils'

type GetVersionResult = {
  vendorName: 'NXP Semiconductors'
  productType: 'NTAG'
  productSubtype: '50 pF'
  majorProductVersion: number
  minorProductVersion: `V${number}`
  storageByteSize: number
  protocolType: 'ISO/IEC 14443-3A'
  icType: IcType
}

export class GetVersionCommand implements ICommand<GetVersionResult> {
  timeoutMs = 5

  // eslint-disable-next-line class-methods-use-this
  build = () => new Uint8Array([0x60])

  parse = (response: Uint8Array) => {
    if (response.length !== 8) {
      throw new ParseError('Invalid response length', response)
    }

    const [
      _fixedHeader,
      vendorID,
      productType,
      productSubtype,
      majorProductVersion,
      minorProductVersion,
      storageSize,
      protocolType,
    ] = response as unknown as FixedLengthUint8<8>

    const parsedResult: GetVersionResult = {
      vendorName: this.parseVendorName(vendorID),
      productType: this.parseProductType(productType),
      productSubtype: this.parseProductSubtype(productSubtype),
      majorProductVersion,
      minorProductVersion: this.parseMinorProductVersion(minorProductVersion),
      storageByteSize: this.parseStorageByteSize(storageSize),
      protocolType: this.parseProtocolType(protocolType),
      icType: this.detectIcType(storageSize),
    }

    return {
      parsed: parsedResult,
      raw: response,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private parseVendorName = (vendorID: number): GetVersionResult['vendorName'] => {
    switch (vendorID) {
      case 0x04:
        return 'NXP Semiconductors'
      default:
        throw new ParseError('Unknown vendor ID', new Uint8Array([vendorID]))
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private parseProductType = (productType: number): GetVersionResult['productType'] => {
    switch (productType) {
      case 0x04:
        return 'NTAG'
      default:
        throw new ParseError('Unknown product type', new Uint8Array([productType]))
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private parseProductSubtype = (productSubtype: number): GetVersionResult['productSubtype'] => {
    switch (productSubtype) {
      case 0x02:
        return '50 pF'
      default:
        throw new ParseError('Unknown product subtype', new Uint8Array([productSubtype]))
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private parseMinorProductVersion = (minorProductVersion: number): GetVersionResult['minorProductVersion'] =>
    `V${minorProductVersion}`

  // eslint-disable-next-line class-methods-use-this
  private parseStorageByteSize = (storageSize: number): GetVersionResult['storageByteSize'] => {
    // eslint-disable-next-line no-bitwise
    const msb = storageSize >> 1
    // eslint-disable-next-line no-bitwise
    const lsb = storageSize & 0x01

    if (msb === 7 && lsb === 1) {
      return 144
    }
    if (msb === 8 && lsb === 1) {
      return 504
    }
    if (msb === 9 && lsb === 1) {
      return 888
    }

    throw new ParseError('Unknown storage size', new Uint8Array([storageSize]))
  }

  // eslint-disable-next-line class-methods-use-this
  private parseProtocolType = (protocolType: number): GetVersionResult['protocolType'] => {
    switch (protocolType) {
      case 0x03:
        return 'ISO/IEC 14443-3A'
      default:
        throw new ParseError('Unknown protocol type', new Uint8Array([protocolType]))
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private detectIcType = (storageSize: number): GetVersionResult['icType'] => {
    // eslint-disable-next-line no-bitwise
    const msb = storageSize >> 1
    // eslint-disable-next-line no-bitwise
    const lsb = storageSize & 0x01

    if (msb === 7 && lsb === 1) {
      return 'NTAG213'
    }
    if (msb === 8 && lsb === 1) {
      return 'NTAG215'
    }
    if (msb === 9 && lsb === 1) {
      return 'NTAG216'
    }

    throw new ParseError('Unknown IC type', new Uint8Array([storageSize]))
  }
}
