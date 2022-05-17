const rootUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
const searchParams = new URLSearchParams({
  client_id: import.meta.env.VITE_GCP_APPID,
  response_type: "token",
  redirect_uri: window.location.origin,
  scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
});

export const authUrl = rootUrl + "?" + searchParams.toString();
