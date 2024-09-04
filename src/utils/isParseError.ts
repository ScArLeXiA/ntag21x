import { ParseError } from 'exceptions'

export const isParseError = (error: unknown): error is ParseError => error instanceof ParseError
