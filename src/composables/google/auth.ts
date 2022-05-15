import { accountStore, AccountType } from "@/stores/account";
import { authUrl } from "@/composables/google/authConfig";
import { ref } from "vue";
import type { AuthContext, TokenContext } from "@/composables/context";

async function randomHexString(length = 16) {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues, (value) => value.toString(length)).join("");
}

interface TokenInfo {
  exp: string;
  email: string;
}

async function getTokenInfo(accessToken: string): Promise<TokenInfo> {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("");
  }
  const result: TokenInfo = await response.json();
  return result;
}

interface StoredData {
  state?: string;
  account?: string;
  token?: string;
  exp?: string;
}

function getStoredData(): StoredData | null {
  const storedDataString = sessionStorage.getItem("gis");
  if (storedDataString === null) return null;
  const storedData: StoredData = JSON.parse(storedDataString);
  return storedData;
}

async function handleRedirect(): Promise<string | null> {
  const hash = window.location.hash;
  if (hash === "") return null;

  const storedData = getStoredData();
  if (storedData === null) return null;

  const hashArr = hash.substring(1).split("&");

  const hashMap = hashArr.reduce((pre, hashPart) => {
    const [key, value] = hashPart.split("=");
    return pre.set(key, value);
  }, new Map<string, string>());

  if (storedData.state === undefined) return null;
  if (hashMap.get("state") !== storedData.state) return null;

  const accessToken = hashMap.get("access_token");
  if (accessToken === undefined) return null;

  const tokenInfo = await getTokenInfo(accessToken);

  sessionStorage.setItem("gis", JSON.stringify({ account: tokenInfo.email, token: accessToken, exp: tokenInfo.exp }));
  window.history.replaceState({}, "", "/");
  return tokenInfo.email;
}

export function getActiveAccount(): string | null {
  const storedData = getStoredData();
  if (storedData === null) return null;
  return storedData.account ?? null;
}

async function getAuthUrl(): Promise<URL> {
  const url = new URL(authUrl);
  const state = await randomHexString(32);
  url.searchParams.set("state", state);
  sessionStorage.setItem("gis", JSON.stringify({ state: state }));
  return url;
}

export function useGoogleAuth(): AuthContext {
  accountStore.google = getActiveAccount();

  async function signIn(): Promise<void> {
    const url = await getAuthUrl();
    window.location.href = url.toString();
  }

  async function signOut(): Promise<void> {
    sessionStorage.removeItem("gis");
    accountStore.google = null;
    if (accountStore.selected === AccountType.Google) {
      accountStore.selected = undefined;
    }
  }

  return {
    signIn,
    signOut,
  };
}

export function useGoogleClient(): void {
  handleRedirect().then((result) => {
    if (result !== null) {
      accountStore.google = result;
      accountStore.selected = AccountType.Google;
    }
  });
}

async function acquireTokenRedirect(account: string) {
  const url = await getAuthUrl();
  url.searchParams.set("login_hint", account);
  window.location.href = url.toString();
}

export function useGoogleToken(): TokenContext {
  const accessToken = ref<string>();

  async function acquireToken() {
    const storedData = getStoredData();
    if (storedData && storedData.token && storedData.exp) {
      if (Date.now() + 10000 < parseInt(storedData.exp) * 1000) {
        accessToken.value = storedData.token;
      } else {
        const account = storedData.account;
        if (account) acquireTokenRedirect(account);
      }
    }
  }

  return {
    accessToken,
    acquireToken,
  };
}
