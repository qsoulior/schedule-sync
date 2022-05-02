import { reactive } from "vue";

interface Store {
  accessToken: string | null;
}

export const store: Store = reactive({
  accessToken: null,
});
