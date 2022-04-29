import {
  InteractionRequiredAuthError,
  type EndSessionPopupRequest,
} from "@azure/msal-browser";
import { AuthService } from "@/services/azure/auth";
import { loginRequest, silentRequest } from "@/services/azure/authConfig";

export class AuthServicePopup extends AuthService {
  constructor() {
    super();
  }

  public async signIn(): Promise<void> {
    const result = await this.client.loginPopup(loginRequest);
    this.handleResponse(result);
  }

  public async signOut(): Promise<void> {
    const logoutRequest: EndSessionPopupRequest = {
      account: this.getActiveAccount(),
    };
    return this.client.logoutPopup(logoutRequest);
  }

  public async getToken(): Promise<string> {
    try {
      const res = await this.client.acquireTokenSilent(silentRequest);
      return res.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        console.warn(
          "Silent token acquisition fails. Acquiring token using popup"
        );
        const res = await this.client.acquireTokenPopup(silentRequest);
        return res.accessToken;
      } else {
        throw error;
      }
    }
  }
}
