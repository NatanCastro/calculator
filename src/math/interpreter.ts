import type { ASTNode, ASTTree } from "./ast";
import { TokenType } from "./tokenizer";


function createNode(type: TokenType, value: string, parent: ASTNode | null = null, left: ASTNode | null = null, right: ASTNode | null = null): ASTNode {
  return {
    type,
    value,
    parent,
    left,
    right,
  }
}

function replaceNode(newNode: ASTNode, oldNode: ASTNode) {
  const parent = oldNode.parent
  if (parent === null) {
    return
  }
  if (parent.left === oldNode) {
    parent.left = newNode
  } else {
    parent.right = newNode
  }
  newNode.parent = parent
}

function valueAsNumber(node: ASTNode) {
  if (node.type === TokenType.Number) {
    return parseFloat(node.value)
  }
  if (node.type === TokenType.Pi) {
    return Math.PI
  }
  throw new Error("Not a number")
}

function calculate(node: ASTNode) {
  if (node.left === null || node.right === null) {
    throw new Error("Invalid operation");
  }
  switch (node.type) {
    case TokenType.Sum:
      return valueAsNumber(node.left) + valueAsNumber(node.right)
    case TokenType.Subtract:
      return valueAsNumber(node.left) - valueAsNumber(node.right)
    case TokenType.Multiply:
      return valueAsNumber(node.left) * valueAsNumber(node.right)
    case TokenType.Divide:
      return valueAsNumber(node.left) / valueAsNumber(node.right)
    default:
      throw new Error("Unexpected token")
  }
}

function isValue(node: ASTNode) {
  return node.type === TokenType.Number || node.type === TokenType.Pi
}

export function interpret(ASTTree: ASTTree) {
  function aux(node: ASTNode) {
    if (node.type === TokenType.Number) {
      return valueAsNumber(node)
    }

    if (node.left === null || node.right === null) {
      throw new Error("Invalid operation");
    }

    if (isValue(node.left) && isValue(node.right)) {
      const result = calculate(node)
      const newNode = createNode(TokenType.Number, result.toString())
      replaceNode(newNode, node)

      if (newNode.parent !== null) {
        return aux(newNode.parent)
      }
      return aux(newNode)
    }

    if (node.left !== null && node.left.type !== TokenType.Number) {
      return aux(node.left)
    }
    if (node.right !== null && node.right.type !== TokenType.Number) {
      return aux(node.right)
    }

    return aux(node)
  }
  return aux(ASTTree.root)
}
