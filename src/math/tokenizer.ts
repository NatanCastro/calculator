import { None, Some, type Option } from "ts-results"
import { ActionType, type Actions } from "../action"
import { next } from "./utils"



export enum MathNumberType {
  Number = "Number",
  Pi = "Pi"
}

export type MathNumber = { id: "number", type: MathNumberType, value: string }

export enum MathOperatorType {
  Sum = "Sum",
  Subtract = "Subtract",
  Multiply = "Multiply",
  Divide = "Divide",
  Percent = "Percent",
  Mod = "Mod",
  Exponent = "Exponent",
  Root = "Root",
}

export type MathOperator = { id: "operator", type: MathOperatorType, value: string }

export enum MathBlockType {
  OpenParenthesis = "OpenParenthesis",
  CloseParenthesis = "CloseParenthesis",
}

export type MathBlock = { id: "block", type: MathBlockType, value: string }


export type MathValue = MathNumber | MathOperator | MathBlock

export type MathExpression = MathValue[]

function createNumber(value: string): MathNumber {
  if (value === "pi") {
    return { id: "number", type: MathNumberType.Pi, value } satisfies MathNumber
  } else {
    return { id: "number", type: MathNumberType.Number, value } satisfies MathNumber
  }
}

function createOperator(type: MathOperatorType): MathOperator {
  switch (type) {
    case MathOperatorType.Sum:
      return { id: "operator", type, value: "+" } satisfies MathOperator
    case MathOperatorType.Subtract:
      return { id: "operator", type, value: "-" } satisfies MathOperator
    case MathOperatorType.Multiply:
      return { id: "operator", type, value: "*" } satisfies MathOperator
    case MathOperatorType.Divide:
      return { id: "operator", type, value: "/" } satisfies MathOperator
    case MathOperatorType.Percent:
      return { id: "operator", type, value: "%" } satisfies MathOperator
    case MathOperatorType.Mod:
      return { id: "operator", type, value: "mod" } satisfies MathOperator
    case MathOperatorType.Exponent:
      return { id: "operator", type, value: "^" } satisfies MathOperator
    case MathOperatorType.Root:
      return { id: "operator", type, value: "√" } satisfies MathOperator
    default:
      throw new Error("Unexpected type")
  }
}

function createBlock(type: MathBlockType): MathBlock {
  switch (type) {
    case MathBlockType.OpenParenthesis:
      return { id: "block", type, value: "(" } satisfies MathBlock
    case MathBlockType.CloseParenthesis:
      return { id: "block", type, value: ")" } satisfies MathBlock
    default:
      throw new Error("Unexpected type")
  }
}

export function isMathNumber(value: MathValue): value is MathNumber {
  return value.id === "number";
}

export function isMathOperator(value: MathValue): value is MathOperator {
  return value.id === "operator";
}

export function isMathBlock(value: MathValue): value is MathBlock {
  return value.id === "block";
}

export function mathExressionToString(tokens: MathExpression): string {
  return tokens.map(token => token.value).join("")
}

export function isMathOperatorType(type: MathOperatorType | MathNumberType): type is MathOperatorType {
  switch (type) {
    case MathOperatorType.Sum:
    case MathOperatorType.Subtract:
    case MathOperatorType.Multiply:
    case MathOperatorType.Divide:
    case MathOperatorType.Percent:
    case MathOperatorType.Mod:
    case MathOperatorType.Exponent:
    case MathOperatorType.Root:
      return true
    default:
      return false
  }
}


function extractNumber(actions: Actions): Option<[MathNumber, Actions]> {
  function aux(actions: Actions, acc: string): Option<[MathNumber, Actions]> {
    const result = next(actions)
    if (result.none) {
      if (acc === "") return None
      else return Some(
        [
          createNumber(acc),
          actions
        ] satisfies [MathNumber, Actions]
      )
    }
    const [action, rest] = result.unwrap()

    if (action.type !== ActionType.Number) {
      return Some(
        [
          createNumber(acc),
          [action].concat(rest)
        ] satisfies [MathNumber, Actions]
      )
    }

    if (acc === "" && action.value === ",") {
      return aux(rest, "0.")
    }
    if (action.value === ",") {
      return aux(rest, acc.concat("."))
    }

    return aux(rest, acc + action.value)
  }

  return aux(actions, "")
}

export function tokensFromActions(actions: Actions): Option<MathExpression> {
  function aux(actions: Actions, tokens: MathExpression): Option<MathExpression> {
    const result = next(actions)
    if (result.none) {
      return Some(tokens)
    }
    const [action, rest] = result.unwrap()
    switch (action.type) {
      case ActionType.Number:
        const result = extractNumber([action].concat(rest))
        if (result.none) {
          return None
        }
        const [number, nextActions] = result.unwrap()
        return aux(nextActions, tokens.concat([number]))
      case ActionType.Pi:
        return aux(rest, tokens.concat([createNumber("pi")]))
      case ActionType.Sum:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Sum)]))
      case ActionType.Subtract:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Subtract)]))
      case ActionType.Multiply:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Multiply)]))
      case ActionType.Divide:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Divide)]))
      case ActionType.Percent:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Percent)]))
      case ActionType.Mod:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Mod)]))
      case ActionType.Exponent:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Exponent)]))
      case ActionType.Root:
        return aux(rest, tokens.concat([createOperator(MathOperatorType.Root)]))
      case ActionType.OpenBlock:
        return aux(rest, tokens.concat([createBlock(MathBlockType.OpenParenthesis)]))
      case ActionType.CloseBlock:
        return aux(rest, tokens.concat([createBlock(MathBlockType.CloseParenthesis)]))
      default:
        return aux(rest, tokens)
    }
  }
  return aux(actions, [])
}
