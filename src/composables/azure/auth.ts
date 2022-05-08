import {
  InteractionRequiredAuthError,
  BrowserAuthError,
  type EndSessionPopupRequest,
  type EndSessionRequest,
} from "@azure/msal-browser";
import { loginRequest, silentRequest } from "@/composables/azure/authConfig";
import { useAzureStore } from "@/stores/azure";
import { Integration, store } from "@/store";

interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

interface TokenContext {
  acquireToken(): Promise<void>;
}

export function useAzureClient(): void {
  const azureStore = useAzureStore();
  azureStore.client.handleRedirectPromise().then((result) => {
    if (result !== null) {
      azureStore.client.setActiveAccount(result.account);
      azureStore.account = result.account;
      store.active = Integration.Graph;
    }
  });
}

export function useAuth({ popup = false } = {}): AuthContext {
  const azureStore = useAzureStore();

  azureStore.account = azureStore.client.getActiveAccount();
  async function signInPopup(): Promise<void> {
    try {
      const result = await azureStore.client.loginPopup(loginRequest);
      azureStore.client.setActiveAccount(result.account);
      azureStore.account = result.account;
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
  const azureStore = useAzureStore();

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
