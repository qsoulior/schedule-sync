import {
  InteractionRequiredAuthError,
  BrowserAuthError,
  type EndSessionPopupRequest,
  type EndSessionRequest,
} from "@azure/msal-browser";
import { loginRequest, silentRequest } from "@/composables/azure/authConfig";
import { azureStore } from "@/stores/azure";
import { accountStore, AccountType } from "@/stores/account";

interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

interface TokenContext {
  acquireToken(): Promise<void>;
}

export function useAzureClient(): void {
  azureStore.client.handleRedirectPromise().then((result) => {
    if (result !== null) {
      azureStore.client.setActiveAccount(result.account);
      azureStore.account = result.account;
      accountStore.selected = AccountType.Azure;
    }
  });
}

export function useAzureAuth({ popup = false } = {}): AuthContext {
  azureStore.account = azureStore.client.getActiveAccount();
  async function signInPopup(): Promise<void> {
    try {
      const result = await azureStore.client.loginPopup(loginRequest);
      azureStore.client.setActiveAccount(result.account);
      azureStore.account = result.account;
      accountStore.selected = AccountType.Azure;
    } catch (error) {
      if (error instanceof BrowserAuthError) {
        alert(error.errorMessage);
      }
    }
  }

  async function signInRedirect(): Promise<void> {
    azureStore.client.loginRedirect(loginRequest);
  }

  async function signOutPopup(): Promise<void> {
    const logoutRequest: EndSessionPopupRequest = {
      account: azureStore.account,
    };
    await azureStore.client.logoutPopup(logoutRequest);
    azureStore.account = null;
  }

  async function signOutRedirect(): Promise<void> {
    const logoutRequest: EndSessionRequest = {
      account: azureStore.account,
    };
    await azureStore.client.logoutRedirect(logoutRequest);
    azureStore.account = null;
  }

  return {
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
  };
}

export function useAzureToken({ popup = false } = {}): TokenContext {
  async function acquireTokenPopup(): Promise<void> {
    try {
      const res = await azureStore.client.acquireTokenSilent(silentRequest);
      azureStore.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const res = await azureStore.client.acquireTokenPopup(silentRequest);
          azureStore.accessToken = res.accessToken;
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
      const res = await azureStore.client.acquireTokenSilent(silentRequest);
      azureStore.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        azureStore.client.acquireTokenRedirect(silentRequest);
      } else {
        throw error;
      }
    }
  }
  return {
    acquireToken: popup ? acquireTokenPopup : acquireTokenRedirect,
  };
}
