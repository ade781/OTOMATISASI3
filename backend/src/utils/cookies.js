export function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,           // PROD wajib true (https)
    sameSite: "lax",          // nanti kita sesuaikan jika FE/BE beda domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari (bisa diubah)
  });
}

export function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
  });
}
