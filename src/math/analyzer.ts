import { None, Some, type Option } from "ts-results";
import { isMathNumber, isMathOperator, isMathValueArray, mathExressionToString, MathOperatorType, type MathExpression, type MathValue } from "./tokenizer";
import { next } from "./utils";

function peek(tokens: MathExpression): Option<MathValue> {
  if (tokens.length === 0) {
    return None
  }
  return Some(tokens[0])
}

export function analyze(tokens: MathExpression): Option<string> {
  function aux(tokens: MathExpression, previousToken: Option<MathValue>, position: number): Option<[string, number]> {
    const possibleToken = next(tokens)
    if (possibleToken.none) {
      return None
    }
    const [token, rest] = possibleToken.unwrap()

    const possibleNextToken = peek(rest)

    if (isMathOperator(token)) {
      if (previousToken.none) { return Some([`No tokens before ${token.type}.`, position] satisfies [string, number]) }
      if (possibleNextToken.none) { return Some([`No tokens after ${token.type}.`, position] satisfies [string, number]) }
      const nextToken = possibleNextToken.unwrap()

      if (isMathOperator(nextToken)) {
        return Some([`There is an unexpected ${nextToken.type} after ${token.type}.`, position] satisfies [string, number])
      }

      if (token.type === MathOperatorType.Divide && isMathNumber(nextToken) && Number(nextToken.value) === 0) {
        return Some([`Cannot divide by zero.`, position] satisfies [string, number])
      }

      return aux(rest, Some(token), position + 1)
    } else if (isMathNumber(token)) {
      if (possibleNextToken.none) {
        return aux(rest, Some(token), position + token.value.length)
      }
      const nextToken = possibleNextToken.unwrap()
      if (isMathNumber(nextToken)) {
        return Some([`There is an unexpected ${nextToken.type} after ${token.type}.`, position] satisfies [string, number])
      }
      if (isMathValueArray(nextToken)) {
        return Some([`There is an unexpected block after ${token.type}.`, position] satisfies [string, number])
      }

      return aux(rest, Some(token), position + token.value.length)
    } else if (isMathValueArray(token)) {
      const error = aux(token, previousToken, position)
      if (error.some) {
        return error
      }

      const nextToken = possibleNextToken.unwrap()
      if (isMathNumber(nextToken)) {
        return Some([`There is an unexpected ${nextToken.type} after block.`, position] satisfies [string, number])
      }
      if (isMathValueArray(nextToken)) {
        return Some([`There is an unexpected block after block.`, position] satisfies [string, number])
      }

    }
    return aux(rest, Some(token), position + 1)
  }

  const option = aux(structuredClone(tokens), None, 0)
  if (option.none) {
    return None
  }

  const expresstionString = mathExressionToString(tokens)
  const [error, position] = option.unwrap()
  const message = `EROR: ${error}\n${expresstionString}\n${" ".repeat(position)}^`
  return Some(message)

}
