import { run } from "../math"
import { ActionType, type Actions } from "./types"
export * from "./types"

export function printActions(actionList: Actions) {
  console.log(actionList.map(action => action.value).join(""))
}

export function resolveAction(actionList: Actions, value: string) {
  switch (value) {
    case "+":
      actionList.push({ type: ActionType.Sum, value })
      break
    case "-":
      actionList.push({ type: ActionType.Subtract, value })
      break
    case "*":
      actionList.push({ type: ActionType.Multiply, value })
      break
    case "/":
      actionList.push({ type: ActionType.Divide, value })
      break
    case "%":
      actionList.push({ type: ActionType.Percent, value })
      break
    case "mod":
      actionList.push({ type: ActionType.Mod, value })
      break
    case "π":
      actionList.push({ type: ActionType.Pi, value })
      break
    case "^":
      actionList.push({ type: ActionType.Exponent, value })
      break
    case "√":
      actionList.push({ type: ActionType.Root, value })
      break
    case "(":
      actionList.push({ type: ActionType.OpenBlock, value })
      break
    case ")":
      actionList.push({ type: ActionType.CloseBlock, value })
      break
    case "del":
      actionList.pop()
      break
    case "enter":
      printActions(actionList)
      const result = run(actionList)
      if (result.err) {
        console.error(result.val)
      } else {
        console.log(result.unwrap())
      }
      break
    default:
      if (actionList.length > 0 && actionList[actionList.length - 1].type != ActionType.Number && value == "," && value == ",") {
        actionList.push({ type: ActionType.Number, value: "0" })
        actionList.push({ type: ActionType.Number, value })
      } else {
        actionList.push({ type: ActionType.Number, value })
      }
  }
}
