import { reactive } from "vue";
import type { AccountInfo } from "@azure/msal-common";

export enum AccountType {
  Graph,
  Google,
}

interface State {
  graph: AccountInfo | null;
  google: string | null;
  selected?: AccountType;
}

export const accountStore = reactive<State>({
  graph: null,
  google: null,
});
