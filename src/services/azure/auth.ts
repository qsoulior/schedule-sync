import { onMounted } from "vue";
import {
  InteractionRequiredAuthError,
  BrowserAuthError,
  type EndSessionPopupRequest,
  type EndSessionRequest,
} from "@azure/msal-browser";
import { loginRequest, silentRequest } from "@/services/azure/authConfig";
import { store } from "@/services/azure/store";

interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

interface TokenContext {
  acquireToken(): Promise<void>;
}

export function useAzureClient(): void {
  onMounted(async () => {
    const result = await store.client.handleRedirectPromise();
    if (result !== null) {
      store.client.setActiveAccount(result.account);
      store.account = result.account;
    }
  });
}

export function useAuth({ popup = false } = {}): AuthContext {
  store.account = store.client.getActiveAccount();
  async function signInPopup(): Promise<void> {
    try {
      const result = await store.client.loginPopup(loginRequest);
      store.client.setActiveAccount(result.account);
      store.account = result.account;
    } catch (error) {
      if (error instanceof BrowserAuthError) {
        alert(error.errorMessage);
      }
    }
  }

  async function signInRedirect(): Promise<void> {
    store.client.loginRedirect(loginRequest);
  }

  async function signOutPopup(): Promise<void> {
    const logoutRequest: EndSessionPopupRequest = {
      account: store.account,
    };
    await store.client.logoutPopup(logoutRequest);
    store.account = null;
  }

  async function signOutRedirect(): Promise<void> {
    const logoutRequest: EndSessionRequest = {
      account: store.account,
    };
    await store.client.logoutRedirect(logoutRequest);
    store.account = null;
  }

  return {
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
  };
}

export function useAzureToken({ popup = false } = {}): TokenContext {
  async function acquireTokenPopup(): Promise<void> {
    try {
      const res = await store.client.acquireTokenSilent(silentRequest);
      store.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const res = await store.client.acquireTokenPopup(silentRequest);
          store.accessToken = res.accessToken;
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
      const res = await store.client.acquireTokenSilent(silentRequest);
      store.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        store.client.acquireTokenRedirect(silentRequest);
      } else {
        throw error;
      }
    }
  }
  return {
    acquireToken: popup ? acquireTokenPopup : acquireTokenRedirect,
  };
}
