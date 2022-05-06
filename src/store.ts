import { reactive } from "vue";

export enum Integration {
  Graph,
  Google,
}

interface Store {
  active?: Integration;
}

export const store = reactive<Store>({
  active: undefined,
});
