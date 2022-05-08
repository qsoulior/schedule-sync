import { reactive } from "vue";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { msalConfig } from "@/composables/azure/authConfig";

interface State {
  client: PublicClientApplication;
  accessToken?: string;
  account: AccountInfo | null;
}

export const azureStore = reactive<State>({
  client: new PublicClientApplication(msalConfig),
  account: null,
});
