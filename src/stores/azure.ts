import { defineStore } from "pinia";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { msalConfig } from "@/composables/azure/authConfig";

interface State {
  client: PublicClientApplication;
  accessToken?: string;
  account: AccountInfo | null;
}

export const useAzureStore = defineStore("azure", {
  state: (): State => ({
    client: new PublicClientApplication(msalConfig),
    account: null,
  }),
  getters: {},
  actions: {},
});
