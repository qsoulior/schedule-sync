import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from "@azure/msal-browser";
import { msalConfig } from "@/services/azure/authConfig";

export abstract class AuthService {
  protected readonly client: PublicClientApplication;

  constructor() {
    this.client = new PublicClientApplication(msalConfig);
  }

  public getActiveAccount(): AccountInfo | null {
    return this.client.getActiveAccount();
  }

  public setActiveAccount(homeId: string) {
    const account = this.client.getAccountByHomeId(homeId);
    if (account !== null) {
      this.client.setActiveAccount(account);
    }
  }

  public getAccounts(): AccountInfo[] {
    return this.client.getAllAccounts();
  }

  protected handleResponse(response: AuthenticationResult): void {
    if (response !== null) {
      this.client.setActiveAccount(response.account);
    }
  }

  abstract signIn(): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract getToken(): Promise<string>;
}
