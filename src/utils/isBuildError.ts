import { BuildError } from 'exceptions'

export const isBuildError = (error: unknown): error is BuildError => error instanceof BuildError
