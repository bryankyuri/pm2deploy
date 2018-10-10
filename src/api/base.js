import { ApiService, ApiTree } from "@apicase/services";
import fetch from "@apicase/adapter-fetch";
import Fingerprint2 from "fingerprintjs2";
import Cookies from "js-cookie";

const apiList = [
  {
    url: "master",
    children: [
      {
        name: "getMasterCity",
        url: "city",
        method: "POST"
      },
      {
        name: "getMasterPersona",
        url: "persona",
        method: "POST"
      },
      {
        name: "getMasterBrandPreferences",
        url: "brand_preferences",
        method: "POST"
      },
      {
        name: "getMasterMeetingPurposes",
        url: "meeting_purpose",
        method: "POST"
      }
    ]
  },
  {
    url: "auth",
    children: [
      {
        name: "authLogin",
        url: "login",
        method: "POST"
      },
      {
        name: "authLogout",
        url: "logout",
        method: "POST"
      },
      {
        name: "authForgot",
        url: "forgot_password",
        method: "POST"
      },
      {
        name: "authReset",
        url: "forgot_password/reset",
        method: "POST"
      }
    ]
  }
];

const getDeviceId = new Promise(resolve => {
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      new Fingerprint2().get(result => resolve(result));
    });
  } else {
    setTimeout(() => {
      new Fingerprint2().get(result => resolve(result));
    }, 500);
  }
});

const serviceLogger = (event, result) => {
  if (process.env.REACT_APP_ENVIRONMENT === "development")
    console.log(event, result);
};

const RootService = new ApiService({
  adapter: fetch,
  url: process.env.REACT_APP_BASE_URL,
  mode: "cors",
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  }
});

// On request success
RootService.on("done", result => {
  serviceLogger(`done`, result);
});

// On request fail
RootService.on("fail", result => {
  serviceLogger(`fail`, result);
});

// On request finish (success doesn't matter)
RootService.on("finish", result => {
  serviceLogger(`finish`, result);
});

// On request start
RootService.on("start", state => {
  serviceLogger("start", state);
});

// On request cancel
RootService.on("cancel", state => {
  serviceLogger("cancel", state);
});

// On JavaScript error happened
RootService.on("error", error => {
  serviceLogger("error", error);
});

const GetTokenService = RootService.extend({
  url: `api/token/get`,
  method: "POST",
  body: {
    name: process.env.REACT_APP_NAME,
    secret_key: process.env.REACT_APP_SECRET_KEY,
    device_type: process.env.REACT_APP_DEVICE_TYPE
  },
  hooks: {
    before({ payload, next }) {
      getDeviceId.then(result => {
        const newPayload = Object.assign({}, payload);
        newPayload.body = {
          ...payload.body,
          device_id: result
        };
        next(newPayload);
      });
    }
  }
});

GetTokenService.on("done", result => {
  const {
    token: { token_code: tokenCode, refresh_token: refreshToken }
  } = result.body.data;

  Cookies.set("token", tokenCode, { expires: 1, path: "/" });
  Cookies.set("refresh-token", refreshToken, { expires: 1, path: "/" });
});

const RefreshTokenService = RootService.extend({
  url: `api/token/get`,
  method: "POST",
  body: {
    name: process.env.REACT_APP_NAME,
    device_type: process.env.REACT_APP_DEVICE_TYPE,
    token: Cookies.get("token"),
    refresh_token: Cookies.get("refresh-token")
  },
  hooks: {
    before({ payload, next }) {
      getDeviceId.then(result => {
        const newPayload = Object.assign({}, payload);
        newPayload.body = {
          ...payload.body,
          device_id: result
        };
        next(newPayload);
      });
    }
  }
});

RefreshTokenService.on("done", result => {
  const { token } = result.body.data;
  const tokenCode = token.token_code;
  const refreshToken = token.refresh_token;

  Cookies.set("token", tokenCode, { expires: 1, path: "/" });
  Cookies.set("refresh-token", refreshToken, { expires: 1, path: "/" });
});

const MainService = new ApiTree(RootService, [
  {
    url: "api",
    children: apiList,
    hooks: {
      before({ payload, next }) {
        const token = Cookies.get("token");
        const newPayload = Object.assign({}, payload);
        newPayload.headers = {
          ...payload.headers,
          [process.env.REACT_APP_TOKEN_HEADER]: token
        };
        next(newPayload);
      },
      async fail({ payload, retry }) {
        retry(payload);
        return true;
      },
      async done({ result, fail, next }) {
        if (result.body.error.code !== 402) return next(result);
        const errorMessage = result.body.error.message;
        if (errorMessage === "Please provide correct token!") {
          const {
            success,
            result: tokenResult
          } = await GetTokenService.doSingleRequest();
          if (success) fail(tokenResult);
        } else if (errorMessage === "Please provide correct token!") {
          const {
            success,
            result: tokenResult
          } = await RefreshTokenService.doSingleRequest();
          if (success) fail(tokenResult);
        }
        return true;
      }
    }
  }
]);

export default MainService;