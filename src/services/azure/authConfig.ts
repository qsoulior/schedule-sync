import type { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AAD_APPID,
    authority: "https://login.microsoftonline.com/common",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Calendars.ReadWrite"],
};

export const silentRequest = {
  scopes: ["User.Read", "Calendars.ReadWrite"],
};
