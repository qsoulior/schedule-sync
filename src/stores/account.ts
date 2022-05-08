import { reactive } from "vue";

export enum AccountType {
  Azure,
  Google,
}

interface State {
  selected?: AccountType;
}

export const accountStore = reactive<State>({});
