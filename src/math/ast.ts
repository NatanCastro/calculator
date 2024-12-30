import { Err, None, Ok, Result, Some, type Option } from "ts-results"
import { TokenType, type Tokens, type Token } from "./tokenizer"

export type ASTNode = {
  type: TokenType
  value: string
  left: ASTNode | null
  right: ASTNode | null
  parent: ASTNode | null
}

export type ASTTree = {
  root: ASTNode
}

function nextToken(tokens: Tokens): [Option<Token>, Tokens] {
  const token = tokens.shift()
  if (token === undefined) {
    return [None, tokens]
  }
  return [Some(token), tokens]
}

function getPrecedence(token: TokenType): number {
  switch (token) {
    case TokenType.Subtract:
      return 1
    case TokenType.Sum:
      return 2
    case TokenType.Multiply:
      return 3
    case TokenType.Divide:
      return 4
    default:
      throw new Error("Unexpected token")
  }
}

function createNode(type: TokenType, value: string, parent: ASTNode | null = null, left: ASTNode | null = null, right: ASTNode | null = null): ASTNode {
  return {
    type,
    value,
    parent,
    left,
    right,
  }
}

function insertNode(parent: ASTNode, child: ASTNode, position: "left" | "right") {
  switch (position) {
    case "left":
      parent.left = child
      break
    case "right":
      parent.right = child
      break
  }
  child.parent = parent
}

function insertReplaceNode(newNode: ASTNode, oldNode: ASTNode) {
  const parent = oldNode.parent
  if (parent === null) {
    newNode.left = oldNode
    oldNode.parent = newNode
    return
  }
  if (parent.left === oldNode) {
    parent.left = newNode
  } else {
    parent.right = newNode
  }
  newNode.parent = parent
  oldNode.parent = newNode
  newNode.left = oldNode
}

function hasLowerPrecedence(node: ASTNode, token: Token) {
  return getPrecedence(node.type) < getPrecedence(token.type)
}

type CaseFunction = (token: Token, head: ASTNode, lastOperation: ASTNode) => [ASTNode, ASTNode]

const baseCase: CaseFunction = (token: Token, head: ASTNode, _: ASTNode) => {
  const newHead: ASTNode = createNode(token.type, token.value)
  insertReplaceNode(newHead, head)
  return [newHead, newHead]
}

const generalCase: CaseFunction = (token: Token, head: ASTNode, lastOperation: ASTNode) => {
  if (head.type === TokenType.Number) {
    return baseCase(token, head, lastOperation)
  }

  if (!hasLowerPrecedence(head, token)) {
    return baseCase(token, head, lastOperation)
  }

  if (hasLowerPrecedence(lastOperation, token)) {
    if (lastOperation.right !== null) {
      const newLastOperation = createNode(token.type, token.value)
      insertReplaceNode(newLastOperation, lastOperation.right)
      return [head, newLastOperation]
    } else {
      const newLastOperation = createNode(token.type, token.value)
      insertNode(newLastOperation, lastOperation, "right")
      return [head, newLastOperation]
    }
  }

  const newLastOperation = createNode(token.type, token.value)
  insertReplaceNode(newLastOperation, lastOperation)
  return [head, newLastOperation]
}

const numberCase: CaseFunction = (token: Token, head: ASTNode, lastOperation: ASTNode) => {
  const numberNode: ASTNode = createNode(token.type, token.value)
  if (lastOperation.left === null) {
    insertNode(lastOperation, numberNode, "left")
  } else {
    insertNode(lastOperation, numberNode, "right")
  }
  return [head, head]
}

const subtractCase: CaseFunction = (token, head, _) => baseCase(token, head, head)

const sumCase: CaseFunction = generalCase

const divideCase: CaseFunction = generalCase

const multiplyCase: CaseFunction = generalCase

function getCaseFunction(token: Token): Result<CaseFunction, Error> {
  switch (token.type) {
    case TokenType.Number:
      return Ok(numberCase)
    case TokenType.Sum:
      return Ok(sumCase)
    case TokenType.Subtract:
      return Ok(subtractCase)
    case TokenType.Divide:
      return Ok(divideCase)
    case TokenType.Multiply:
      return Ok(multiplyCase)
    default:
      return Err(new Error("Unexpected token"))
  }
}

export function createAST(tokens: Tokens): ASTTree {
  function aux(tokens: Tokens, head: ASTNode, lastOperation: ASTNode): ASTNode {
    const [possibleToken, rest] = nextToken(tokens)
    if (possibleToken.none) {
      return head;
    }

    const token = possibleToken.unwrap()

    const possibleCaseFunction = getCaseFunction(token)
    if (possibleCaseFunction.err) {
      throw possibleCaseFunction.val
    }

    const caseFunction = possibleCaseFunction.unwrap()

    const [newHead, newLastOperation] = caseFunction(token, head, lastOperation)
    return aux(rest, newHead, newLastOperation)
  }

  const [possibleToken, rest] = nextToken(tokens)
  if (possibleToken.none) {
    throw new Error("Empty expression")
  }

  const token = possibleToken.unwrap()
  const head: ASTNode = createNode(token.type, token.value)
  return { root: aux(rest, head, head) }
}
