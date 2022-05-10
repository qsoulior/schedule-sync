import { reactive } from "vue";
import type { AccountInfo } from "@azure/msal-common";

export enum AccountType {
  Azure,
  Google,
}

interface State {
  azure: AccountInfo | null;
  google: string | null;
  selected?: AccountType;
}

export const accountStore = reactive<State>({
  azure: null,
  google: null,
});
