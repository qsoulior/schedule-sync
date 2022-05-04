import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { msalConfig } from "@/services/azure/authConfig";
import { reactive } from "vue";

interface Store {
  client: PublicClientApplication;
  accessToken: string | null;
  account: AccountInfo | null;
}

export const store = reactive<Store>({
  client: new PublicClientApplication(msalConfig),
  accessToken: null,
  account: null,
});
