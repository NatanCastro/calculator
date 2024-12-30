export enum ActionType {
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


export type Action = {
  type: ActionType
  value: string
}


export type Actions = Action[]

