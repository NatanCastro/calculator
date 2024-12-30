import { None, Some, type Option } from "ts-results";
import { TokenType, type Token, type Tokens } from "./tokenizer";

function peek(tokens: Tokens, currentPosition: number): Option<Token> {
  const position = currentPosition + 1
  if (position >= tokens.length) {
    return None
  }
  return Some(tokens[position])
}

function previous(tokens: Tokens, currentPosition: number): Option<Token> {
  const position = currentPosition - 1
  if (position < 0) {
    return None
  }
  return Some(tokens[position])
}

export function analyze(tokens: Tokens): Option<string> {
  let position = 0
  let numberOfunfinishedBlocks = 0
  let nextToken: Option<Token> = None
  let previousToken: Option<Token> = None
  while (position < tokens.length) {
    const token = tokens[position]
    nextToken = peek(tokens, position)
    if (nextToken.none) {
      position++
      continue
    }

    switch (token.type) {
      case TokenType.OpenBlock:
        nextToken = peek(tokens, position)
        switch (nextToken.unwrap().type) {
          case TokenType.Square:
          case TokenType.Sum:
          case TokenType.Multiply:
          case TokenType.Divide:
          case TokenType.Percent:
          case TokenType.Mod:
            return Some(`There is an unexpected ${nextToken.unwrap().type} after open block. position: ${position}`)
        }
        numberOfunfinishedBlocks++
        position++
        break
      case TokenType.CloseBlock:
        nextToken = peek(tokens, position)
        switch (nextToken.unwrap().type) {
          case TokenType.Root:
          case TokenType.Pi:
          case TokenType.Number:
            return Some(`There is an unexpected ${nextToken.unwrap().type} after close block. position: ${position}`)
        }
        numberOfunfinishedBlocks--
        position++
        break
      case TokenType.Sum:
      case TokenType.Subtract:
      case TokenType.Multiply:
      case TokenType.Divide:
      case TokenType.Percent:
      case TokenType.Mod:
        previousToken = previous(tokens, position)
        if (previousToken.none) { return Some(`No tokens before ${token.type}. position: ${position}`) }
        switch (previousToken.unwrap().type) {
          case TokenType.Number:
          case TokenType.CloseBlock:
            break
          default:
            return Some(`There is an unexpected ${previousToken.unwrap().type} before ${token.type}. position: ${position}`)
        }
        nextToken = peek(tokens, position)
        if (nextToken.some && nextToken.unwrap().type === token.type) {
          return Some(`There is an unexpected ${nextToken.unwrap().type} after ${token.type}. position: ${position}`)
        }
        position++
        break
      case TokenType.Number:
        nextToken = peek(tokens, position)
        if (!nextToken) { position++; break }
        switch (nextToken.unwrap().type) {
          case TokenType.Pi:
          case TokenType.Root:
            return Some(`There is an unexpected ${nextToken.unwrap().type} after number. position: ${position}`)
        }
        position++
        break
      case TokenType.Pi:
        nextToken = peek(tokens, position)
        switch (nextToken.unwrap().type) {
          case TokenType.Number:
          case TokenType.Root:
            return Some(`There is an unexpected ${nextToken.unwrap().type} after pi. position: ${position}`)
        }
        position++
        break
      case TokenType.Square:
        previousToken = previous(tokens, position)
        if (previousToken.none) { return Some(`No tokens before square. position: ${position}`) }
        switch (previousToken.unwrap().type) {
          case TokenType.Number:
          case TokenType.CloseBlock:
          case TokenType.Pi:
            break
          default:
            return Some(`There is an unexpected ${previousToken.unwrap().type} before square. position: ${position}`)
        }
        position++
        break
      case TokenType.Root:
        nextToken = peek(tokens, position)
        if (!nextToken) { position++; break }
        switch (nextToken.unwrap().type) {
          case TokenType.Number:
          case TokenType.Subtract:
            break
          default:
            return Some(`There is an unexpected ${nextToken.unwrap().type} after root. position: ${position}`)
        }
        position++
        break
    }
  }

  if (numberOfunfinishedBlocks !== 0) {
    return Some("There are still open blocks")
  }
  return None
}
