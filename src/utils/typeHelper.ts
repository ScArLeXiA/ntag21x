export type FixedLengthArray<T, N extends number, R extends unknown[] = []> = R['length'] extends N
  ? R
  : FixedLengthArray<T, N, [...R, T]>

export type FixedLengthUint8<N extends number> = FixedLengthArray<Uint8Array[number], N>
export type FixedLengthUint8Array<N extends number> = FixedLengthArray<Uint8Array, N>
