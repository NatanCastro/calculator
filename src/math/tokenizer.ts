import { type Actions, ActionType } from "../action"

export enum TokenType {
  Number = 'Number',
  Sum = 'Sum',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Percent = 'Percent',
  Mod = 'Mod',
  Pi = 'Pi',
  Square = 'Square',
  Root = 'Root',
  OpenBlock = 'OpenBlock',
  CloseBlock = 'CloseBlock',
}

export type Token = {
  type: TokenType
  value: string
}

export type Tokens = Token[]

function extractNumber(actions: Actions, position: number): [Token | null, number] {
  let number = ""
  while (position < actions.length && actions[position].type === ActionType.Number) {
    const action = actions[position]
    if (action.type == ActionType.Number) {
      if (number === "" && action.value === ",") {
        number = "0"
      }
      number += action.value
      position++
    }
  }
  return number === "" ? [null, position] : [{ type: TokenType.Number, value: number }, position]
}

export function tokensFromActions(actions: Actions): Tokens {
  let position = 0
  let tokens: Token[] = []
  while (position < actions.length) {
    const action = actions[position]
    switch (action.type) {
      case ActionType.Number:
        const [token, newPosition] = extractNumber(actions, position)
        if (token) {
          tokens.push(token)
        }
        position = newPosition
        break
      case ActionType.Sum:
        tokens.push({ type: TokenType.Sum, value: "+" })
        position++
        break
      case ActionType.Subtract:
        tokens.push({ type: TokenType.Subtract, value: "-" })
        position++
        break
      case ActionType.Multiply:
        tokens.push({ type: TokenType.Multiply, value: "*" })
        position++
        break
      case ActionType.Divide:
        tokens.push({ type: TokenType.Divide, value: "/" })
        position++
        break
      case ActionType.Percent:
        tokens.push({ type: TokenType.Percent, value: "%" })
        position++
        break
      case ActionType.Mod:
        tokens.push({ type: TokenType.Mod, value: "mod" })
        position++
        break
      case ActionType.Pi:
        tokens.push({ type: TokenType.Pi, value: "π" })
        position++
        break
      case ActionType.Square:
        tokens.push({ type: TokenType.Square, value: "x²" })
        position++
        break
      case ActionType.Root:
        tokens.push({ type: TokenType.Root, value: "√" })
        position++
        break
      case ActionType.OpenBlock:
        tokens.push({ type: TokenType.OpenBlock, value: "(" })
        position++
        break
      case ActionType.CloseBlock:
        tokens.push({ type: TokenType.CloseBlock, value: ")" })
        position++
        break
      default:
        position++
    }
  }
  return tokens
}
