const isProd = process.env.NODE_ENV === "production";

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/auth",
  });
};

export const setAccessCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    ...COOKIE_CONFIG,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    ...COOKIE_CONFIG,
    path: "/auth",
  });
};

export const clearAccessCookie = (res) => {
  res.clearCookie("accessToken", {
    ...COOKIE_CONFIG,
    path: "/",
  });
};

export const setCsrfCookie = (res, csrfToken) => {
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearCsrfCookie = (res) => {
  res.clearCookie("csrfToken", {
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  });
};
