import {
  msalConfig,
  loginRequest,
  silentRequest,
} from "@/services/azure/authConfig";
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  BrowserAuthError,
  type AccountInfo,
  type EndSessionPopupRequest,
  type EndSessionRequest,
} from "@azure/msal-browser";
import { onMounted, ref, type Ref } from "vue";

interface AuthContext {
  account: Ref<AccountInfo | null>;
  accessToken: Ref<string | undefined>;
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

  const accessToken = ref<string | undefined>();
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
    account: account,
    accessToken: accessToken,
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
    acquireToken: popup ? acquireTokenPopup : acquireTokenRedirect,
  };
}
