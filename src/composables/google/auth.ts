import { accountStore, AccountType } from "@/stores/account";

const rootUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
const searchParams = new URLSearchParams({
  client_id: "",
  response_type: "id_token token",
  redirect_uri: "http://localhost:3000",
  scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
});

export const authUrl = rootUrl + "?" + searchParams.toString();

async function randomHexString(length = 16) {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues, (value) => value.toString(length)).join("");
}

interface TokenInfo {
  exp: string;
  email: string;
  nonce: string;
}

async function getTokenInfo(idToken: string): Promise<TokenInfo> {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`, {
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
  nonce?: string;
  username?: string;
}

function getStoredData(): StoredData | null {
  const storedDataString = sessionStorage.getItem("gis");
  if (storedDataString === null) return null;
  const storedData: StoredData = JSON.parse(storedDataString);
  return storedData;
}

export async function handleRedirect(): Promise<string | null> {
  const hash = window.location.hash;
  if (hash === "") return null;

  const storedData = getStoredData();
  if (storedData === null) return null;

  const hashArr = hash.substring(1).split("&");

  const hashMap = hashArr.reduce((pre, hashPart) => {
    const [key, value] = hashPart.split("=");
    return pre.set(key, value);
  }, new Map<string, string>());

  if (storedData.state === undefined || storedData.nonce === undefined) return null;
  if (hashMap.get("state") !== storedData.state) return null;

  const idToken = hashMap.get("id_token");
  if (idToken === undefined) return null;

  const tokenInfo = await getTokenInfo(idToken);
  if (storedData.nonce !== tokenInfo.nonce) return null;

  sessionStorage.setItem("gis", JSON.stringify({ username: tokenInfo.email }));
  window.history.replaceState({}, "", "/");
  return tokenInfo.email;
}

export function getActiveAccount(): string | null {
  const storedData = getStoredData();
  if (storedData === null) return null;
  return storedData.username ?? null;
}

interface AuthContext {
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export function useGoogleAuth(): AuthContext {
  accountStore.google = getActiveAccount();

  async function signIn(): Promise<void> {
    const url = new URL(authUrl);
    const nonce = await randomHexString(16);
    url.searchParams.set("nonce", nonce);
    const state = await randomHexString(32);
    url.searchParams.set("state", state);
    sessionStorage.setItem("gis", JSON.stringify({ state: state, nonce: nonce }));
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
