import { Err, Ok, type Result } from "ts-results"
import type { Actions } from "../action"
import { tokensFromActions } from "./tokenizer"
import { analyze } from "./analyzer"
import { createAST } from "./ast"
import { interpret } from "./interpreter"

export * from "./ast"
export * from "./tokenizer"
export * from "./analyzer"

export function run(expression: Actions): Result<number, string> {
  const optionTokens = tokensFromActions(expression)
  if (optionTokens.none) {
    console.log("Error")
  }
  const tokens = optionTokens.unwrap()

  const error = analyze(structuredClone(tokens))
  if (error.some) {
    return Err(error.val)
  }
  const ast = createAST(structuredClone(tokens))

  const result = interpret(ast)

  return Ok(result)
}
