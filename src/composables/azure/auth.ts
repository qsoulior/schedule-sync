import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  BrowserAuthError,
  type EndSessionPopupRequest,
} from "@azure/msal-browser";
import { loginRequest, msalConfig, silentRequest } from "@/composables/azure/authConfig";
import { accountStore, AccountType } from "@/stores/account";
import { ref, type Ref } from "vue";

interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

interface TokenContext {
  accessToken: Ref<string | undefined>;
  acquireToken(): Promise<void>;
}

const client = new PublicClientApplication(msalConfig);

export function useAzureClient(): void {
  client.handleRedirectPromise().then((result) => {
    if (result !== null) {
      client.setActiveAccount(result.account);
      accountStore.azure = result.account;
      accountStore.selected = AccountType.Azure;
    }
  });
}

export function useAzureAuth({ popup = false } = {}): AuthContext {
  accountStore.azure = client.getActiveAccount();
  async function signInPopup(): Promise<void> {
    try {
      const result = await client.loginPopup(loginRequest);
      client.setActiveAccount(result.account);
      accountStore.azure = result.account;
      accountStore.selected = AccountType.Azure;
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
      account: accountStore.azure,
    };
    await client.logoutPopup(logoutRequest);
    accountStore.azure = null;
  }

  async function signOutRedirect(): Promise<void> {
    await client.logoutRedirect({
      onRedirectNavigate: () => false,
    });
    accountStore.azure = null;
    accountStore.selected = undefined;
  }

  return {
    signIn: popup ? signInPopup : signInRedirect,
    signOut: popup ? signOutPopup : signOutRedirect,
  };
}

export function useAzureToken({ popup = false } = {}): TokenContext {
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
