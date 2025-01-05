import { Err, Ok, Result, Some } from "ts-results"
import { createNode, type ASTBranch, type ASTNode, type ASTNodeNumber, type ASTNodeOperator, type ASTTree } from "./ast"
import { MathNumberType, MathOperatorType } from "./tokenizer"

function createNumberNode(value: string): ASTNodeNumber {
  return createNode(MathNumberType.Number, value) as ASTNodeNumber
}

function replaceNode(newNode: ASTNode, oldNode: ASTNode): ASTNode {
  const parent = oldNode.parent
  if (parent.none) {
    return newNode
  }
  const parentUnwrapped = parent.unwrap()
  if (parentUnwrapped.left.some && parentUnwrapped.left.unwrap() === oldNode) {
    parentUnwrapped.left = Some(newNode)
    newNode.parent = parent
    return newNode
  }
  if (parentUnwrapped.right.some && parentUnwrapped.right.unwrap() === oldNode) {
    parentUnwrapped.right = Some(newNode)
    newNode.parent = parent
    return newNode
  }
  return newNode
}

function calculate(node: ASTNodeOperator): Result<number, Error> {
  if (node.left.none || node.right.none) {
    return Err(new Error("Invalid operation"))
  }
  const left = node.left.unwrap()
  const right = node.right.unwrap()

  if (left.id !== "number" || right.id !== "number") {
    return Err(new Error("Invalid operation"))
  }

  try {
    switch (node.type) {
      case MathOperatorType.Sum:
        return Ok(left.value + right.value)
      case MathOperatorType.Subtract:
        return Ok(left.value - right.value)
      case MathOperatorType.Multiply:
        return Ok(left.value * right.value)
      case MathOperatorType.Divide:
        return Ok(left.value / right.value)
      case MathOperatorType.Percent:
        return Ok((left.value / 100) * right.value)
      case MathOperatorType.Mod:
        return Ok(left.value - Math.floor(left.value / right.value) * right.value)
      case MathOperatorType.Exponent:
        return Ok(Math.pow(left.value, right.value))
      case MathOperatorType.Root:
        if (!isFinite(right.value)) {
          return Ok(0)
        }

        if (right.value % 2 === 0) {
          return Ok(Math.pow(left.value, 1 / right.value))
        } else {
          const result = Math.pow(left.value, 1 / right.value)
          return Ok(result * right.value > 0 ? 1 : -1)
        }
    }
  } catch (error: any) {
    return Err(error)
  }
}

export function interpret(ASTTree: ASTTree): number {
  function traverse(node: ASTNode): number {
    if (node.id === "number") {
      return node.value
    }
    if (node.left.none || node.right.none) {
      throw new Error("Invalid operation")
    }
    const left = node.left.unwrap()
    const right = node.right.unwrap()

    if (node.id === "operator") {
      if (left.id === "number" && right.id === "number") {
        const result = calculate(node)
        if (result.err) {
          throw result.val
        }
        const resultNode = createNumberNode(result.unwrap().toString())
        const newNode = replaceNode(resultNode, node)
        if (newNode.parent.none) {
          return traverse(newNode)
        }
        return traverse(newNode.parent.unwrap())
      }

      if (left.id === "operator") {
        return traverse(left)
      }
      if (right.id === "operator") {
        return traverse(right)
      }
    }
    throw new Error("Unexpected node")
  }

  function aux(branch: ASTBranch): number {
    if (branch.branches.length !== 0) {
      branch.branches.forEach(aux)
    }
    const node = branch.head.unwrap()
    return traverse(node)
  }
  return aux(ASTTree.stem)
}
