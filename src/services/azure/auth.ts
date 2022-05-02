import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  BrowserAuthError,
  type AccountInfo,
  type EndSessionPopupRequest,
  type EndSessionRequest,
} from "@azure/msal-browser";
import { onMounted, ref, type Ref } from "vue";
import { msalConfig, loginRequest, silentRequest } from "@/services/azure/authConfig";
import { store } from "@/store";

interface AuthContext {
  account: Ref<AccountInfo | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  acquireToken(): Promise<void>;
}

export function useAuth({ popup = false } = {}): AuthContext {
  const client = new PublicClientApplication(msalConfig);
  const account = ref<AccountInfo | null>(client.getActiveAccount());

  onMounted(async () => {
    if (!popup) {
      const result = await client.handleRedirectPromise();
      if (result !== null) {
        client.setActiveAccount(result.account);
        account.value = result.account;
      }
    }
  });

  async function signInPopup(): Promise<void> {
    try {
      const result = await client.loginPopup(loginRequest);
      client.setActiveAccount(result.account);
      account.value = result.account;
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
      account: account.value,
    };
    await client.logoutPopup(logoutRequest);
    account.value = null;
  }

  async function signOutRedirect(): Promise<void> {
    const logoutRequest: EndSessionRequest = {
      account: account.value,
    };
    await client.logoutRedirect(logoutRequest);
    account.value = null;
  }

  async function acquireTokenPopup(): Promise<void> {
    try {
      const res = await client.acquireTokenSilent(silentRequest);
      store.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const res = await client.acquireTokenPopup(silentRequest);
          store.accessToken = res.accessToken;
        } catch (error) {
          if (error instanceof BrowserAuthError) {
            alert(error.errorMessage);
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
      store.accessToken = res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        client.acquireTokenRedirect(silentRequest);
      } else {
        throw error;
      }
    }
  }

  return {
    account,
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
    acquireToken: popup ? acquireTokenPopup : acquireTokenRedirect,
  };
}
