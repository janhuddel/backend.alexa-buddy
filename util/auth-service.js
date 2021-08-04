const axios = require("axios").default;
const qs = require("query-string");

const AMAZON_TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token";
const AMAZON_PROFILE_ENDPOINT = "https://api.amazon.com/user/profile";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

module.exports.getAccessToken = async (code) => {
  const response = await axios.post(
    AMAZON_TOKEN_ENDPOINT,
    qs.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};

module.exports.getUserProfile = async (accessToken) => {
  const response = await axios.get(AMAZON_PROFILE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
