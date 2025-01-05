import { Err, None, Ok, Result, Some, type Option } from "ts-results"
import { next } from "./utils"
import { isMathNumber, isMathOperator, isMathOperatorType, isMathValueArray, MathNumberType, MathOperatorType } from "./tokenizer"
import type { MathExpression, MathNumber, MathOperator } from "./tokenizer"

export type ASTNodeOperator = {
  id: "operator"
  type: MathOperatorType
  value: string
  parent: Option<ASTNodeOperator>
  left: Option<ASTNode>
  right: Option<ASTNode>
}
export type ASTNodeNumber = {
  id: "number"
  type: MathNumberType
  value: number
  parent: Option<ASTNodeOperator>
}

export type ASTNode = ASTNodeOperator | ASTNodeNumber

export type ASTBranch = {
  head: Option<ASTNode>
  branches: ASTBranch[]
}

export type ASTTree = {
  stem: ASTBranch
}

function newASTBranch(head: Option<ASTNode> = None, branches: ASTBranch[] = []): ASTBranch {
  return {
    head,
    branches
  }
}

function newASTTree(stem: ASTBranch): ASTTree {
  return {
    stem
  }
}

function getPrecedence(token: MathOperatorType): number {
  switch (token) {
    case MathOperatorType.Subtract:
      return 1
    case MathOperatorType.Sum:
      return 2
    case MathOperatorType.Multiply:
      return 3
    case MathOperatorType.Divide:
      return 4
    case MathOperatorType.Exponent:
      return 5
    case MathOperatorType.Root:
      return 6
    case MathOperatorType.Mod:
      return 7
    default:
      throw new Error("Unexpected token")
  }
}

export function createNode(
  type: MathOperatorType | MathNumberType,
  value: string,
  parent: Option<ASTNodeOperator> = None,
  left: Option<ASTNode> = None,
  right: Option<ASTNode> = None
): ASTNode {
  if (isMathOperatorType(type)) {
    return {
      id: "operator",
      type,
      value,
      parent,
      left,
      right
    }
  } else {
    return {
      id: "number",
      type,
      value: value === "pi" ? Math.PI : Number(value),
      parent
    }
  }
}

function insertNode(parent: ASTNodeOperator, child: ASTNode, position: "left" | "right") {
  if (parent.id === "operator") {
    switch (position) {
      case "left":
        parent.left = Some(child)
        break
      case "right":
        parent.right = Some(child)
        break
    }
    child.parent = Some(parent)
  }
}

function insertReplaceNode(newNode: ASTNodeOperator, oldNode: ASTNode) {
  const parent = oldNode.parent
  if (parent.none) {
    newNode.left = Some(oldNode)
    oldNode.parent = Some(newNode)
    return
  }
  const parentUnwrapped = parent.unwrap()

  if (parentUnwrapped.left.some && parentUnwrapped.left.unwrap() === oldNode) {
    parentUnwrapped.left = Some(newNode)
  } else if (parentUnwrapped.right.some && parentUnwrapped.right.unwrap() === oldNode) {
    parentUnwrapped.right = Some(newNode)
  }

  newNode.parent = parent
  oldNode.parent = Some(newNode)
  newNode.left = Some(oldNode)
}

function hasLowerPrecedence(node: ASTNodeOperator, token: MathOperator) {
  return getPrecedence(node.type) < getPrecedence(token.type)
}

type NumberCaseFunction = (token: MathNumber, branch: ASTBranch, lastOperation: Option<ASTNodeOperator>) => [ASTBranch, Option<ASTNodeOperator>]

type OperatorCaseFunction = (token: MathOperator, head: ASTBranch, lastOperation: Option<ASTNodeOperator>) => [ASTBranch, Option<ASTNodeOperator>]


const baseCase: OperatorCaseFunction = (token, branch, _) => {
  const newHead = createNode(token.type, String(token.value)) as ASTNodeOperator
  if (branch.head.none) {
    branch.head = Some(newHead)
    return [branch, Some(newHead)]
  }
  const oldHead = branch.head.unwrap()

  insertReplaceNode(newHead, oldHead)
  branch.head = Some(newHead)
  return [branch, Some(newHead)]
}

const generalCase: OperatorCaseFunction = (token, branch, lastOperation) => {
  if (isMathNumber(token) || branch.head.none) {
    return baseCase(token, branch, lastOperation)
  }

  if (branch.head.unwrap().id === "number") {
    return baseCase(token, branch, lastOperation)
  }

  if (!hasLowerPrecedence(branch.head.unwrap() as ASTNodeOperator, token)) {
    return baseCase(token, branch, lastOperation)
  }

  const newLastOperation = createNode(token.type, token.value) as ASTNodeOperator
  const oldLastOperation = lastOperation.unwrap()
  if (hasLowerPrecedence(oldLastOperation, token)) {
    if (oldLastOperation.right.none) {
      insertNode(newLastOperation, oldLastOperation, "right")
      return [branch, Some(newLastOperation)]
    } else {
      insertReplaceNode(newLastOperation, oldLastOperation.right.unwrap())
      return [branch, Some(newLastOperation)]
    }
  }

  insertReplaceNode(newLastOperation, oldLastOperation)
  return [branch, Some(newLastOperation)]
}

const numberCase: NumberCaseFunction = (token, branch, lastOperation) => {
  const node = createNode(token.type, String(token.value))
  if (lastOperation.none) {
    branch.head = Some(node)
    return [branch, lastOperation]
  }

  const lastOperationNode = lastOperation.unwrap()
  if (lastOperationNode.left.none) {
    insertNode(lastOperationNode, node, "left")
  } else if (lastOperationNode.right.none) {
    insertNode(lastOperationNode, node, "right")
  } else {
    throw new Error("Ureachable, last operation has both left and right")
  }
  return [branch, lastOperation]
}

const subtractCase = baseCase
const sumCase = generalCase
const divideCase = generalCase
const multiplyCase = generalCase
const percentCase = generalCase
const rootCase = generalCase
const modCase = generalCase
const exponentCase = generalCase



function getCaseFunction(token: MathOperator): Result<OperatorCaseFunction, Error> {
  switch (token.type) {
    case MathOperatorType.Sum:
      return Ok(sumCase)
    case MathOperatorType.Subtract:
      return Ok(subtractCase)
    case MathOperatorType.Divide:
      return Ok(divideCase)
    case MathOperatorType.Multiply:
      return Ok(multiplyCase)
    case MathOperatorType.Percent:
      return Ok(percentCase)
    case MathOperatorType.Root:
      return Ok(rootCase)
    case MathOperatorType.Mod:
      return Ok(modCase)
    case MathOperatorType.Exponent:
      return Ok(exponentCase)
    default:
      return Err(new Error("Unexpected token"))
  }
}

export function createAST(tokens: MathExpression): ASTTree {
  function aux(tokens: MathExpression, branch: ASTBranch, lastOperation: Option<ASTNodeOperator> = None): Result<ASTBranch, Error> {
    const result = next(tokens)

    if (result.none) {
      return Ok(branch)
    }
    const [token, rest] = result.unwrap()

    if (branch.head.none) {
      if (isMathValueArray(token)) {
        const newBranch = aux(token, newASTBranch())
        if (newBranch.err) {
          return newBranch
        }
        const result = next(rest)

        if (result.none) {
          branch = newBranch.unwrap()
          return Ok(branch)
        }
        const [head, nextTokens] = result.unwrap()

        if (isMathOperator(head)) {
          const headNode = createNode(head.type, head.value) as ASTNodeOperator
          const headBranch = newASTBranch(Some(headNode), [newBranch.unwrap()])
          return aux(nextTokens, headBranch, Some(headNode))
        } else {
          return Err(new Error("Ureachable, operator expected"))
        }
      } else if (isMathOperator(token)) {
        const result = getCaseFunction(token)
        if (result.err) {
          return Err(result.val)
        }
        const caseFunction = result.unwrap()

        const [newBranch, newLastOperation] = caseFunction(token, branch, lastOperation)
        return aux(rest, newBranch, newLastOperation)
      } else {
        const [newBranch, newLastOperation] = numberCase(token, branch, lastOperation)
        return aux(rest, newBranch, newLastOperation)
      }
    }

    if (isMathNumber(token)) {
      const [newBranch, newLastOperation] = numberCase(token, branch, lastOperation)
      return aux(rest, newBranch, newLastOperation)
    } else if (isMathOperator(token)) {
      const result = getCaseFunction(token)
      if (result.err) {
        throw result.val
      }
      const [newBranch, newLastOperation] = result.unwrap()(token, branch, lastOperation)
      return aux(rest, newBranch, newLastOperation)
    } else {
      const resultBranch = aux(token, newASTBranch())
      if (resultBranch.err) {
        return resultBranch
      }
      const newBranch = resultBranch.unwrap()
      const newBranchHead = newBranch.head.unwrap()

      const lastOperationUnwrapped = lastOperation.unwrap()
      if (lastOperationUnwrapped.left.none) {
        insertNode(lastOperationUnwrapped, newBranchHead, "left")
      } else if (lastOperationUnwrapped.right.none) {
        insertNode(lastOperationUnwrapped, newBranchHead, "right")
      }

      branch.branches.push(newBranch)
      return aux(rest, branch, lastOperation)
    }
  }

  const result = aux(tokens, newASTBranch())
  if (result.err) {
    throw result.val
  }
  return newASTTree(result.unwrap())
}
