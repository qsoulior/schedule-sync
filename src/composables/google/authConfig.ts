const rootUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
const searchParams = new URLSearchParams({
  client_id: "",
  response_type: "id_token token",
  redirect_uri: "http://localhost:3000",
  scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
});

export const authUrl = rootUrl + "?" + searchParams.toString();
