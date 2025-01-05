import { None, Some, type Option } from "ts-results"

export function next<T>(values: T[]): Option<[T, T[]]> {
  const token = values.shift()
  if (token === undefined) {
    return None
  }
  return Some([token, values] satisfies [T, T[]])
}
