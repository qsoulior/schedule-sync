import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  BrowserAuthError,
  type EndSessionPopupRequest,
} from "@azure/msal-browser";
import { loginRequest, msalConfig, silentRequest } from "@/composables/graph/authConfig";
import { accountStore, AccountType } from "@/stores/account";
import { ref } from "vue";
import type { AuthContext, TokenContext } from "@/composables/context";

const client = new PublicClientApplication(msalConfig);

export function useGraphClient(): void {
  client.handleRedirectPromise().then((result) => {
    if (result !== null) {
      client.setActiveAccount(result.account);
      accountStore.graph = result.account;
      accountStore.selected = AccountType.Graph;
    }
  });
}

export function useGraphAuth({ popup = false } = {}): AuthContext {
  accountStore.graph = client.getActiveAccount();
  async function signInPopup(): Promise<void> {
    try {
      const result = await client.loginPopup(loginRequest);
      client.setActiveAccount(result.account);
      accountStore.graph = result.account;
      accountStore.selected = AccountType.Graph;
    } catch (error) {
      if (error instanceof BrowserAuthError) {
        alert(error.errorMessage);
      }
    }
  }

  async function signInRedirect(): Promise<void> {
    client.loginRedirect(loginRequest);
  }

  async function signOutPopup(): Promise<void> {
    const logoutRequest: EndSessionPopupRequest = {
      account: accountStore.graph,
    };
    await client.logoutPopup(logoutRequest);
    accountStore.graph = null;
  }

  async function signOutRedirect(): Promise<void> {
    await client.logoutRedirect({
      onRedirectNavigate: () => false,
    });
    accountStore.graph = null;
    accountStore.selected = undefined;
  }

  return {
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
  };
}

export function useGraphToken({ popup = false } = {}): TokenContext {
  const accessToken = ref<string>();

  async function acquireTokenPopup(): Promise<void> {
    try {
      const res = await client.acquireTokenSilent(silentRequest);
      accessToken.value = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const res = await client.acquireTokenPopup(silentRequest);
          accessToken.value = res.accessToken;
        } catch (error) {
          if (error instanceof BrowserAuthError) {
            throw error.errorMessage;
          } else {
            throw error;
          }
        }
      } else {
        throw error;
      }
    }
  }
  async function acquireTokenRedirect(): Promise<void> {
    try {
      const res = await client.acquireTokenSilent(silentRequest);
      accessToken.value = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        client.acquireTokenRedirect(silentRequest);
      } else {
        throw error;
      }
    }
  }
  return {
    accessToken,
    acquireToken: popup ? acquireTokenPopup : acquireTokenRedirect,
  };
}
