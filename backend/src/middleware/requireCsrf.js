const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const isUnsafeMethod = (method) => UNSAFE_METHODS.has(method.toUpperCase());

export const requireCsrfForUnsafeMethods = (req, res, next) => {
  if (!isUnsafeMethod(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      status: "error",
      code: "CSRF_MISSING",
      message: "CSRF token is required for this request",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      status: "error",
      code: "CSRF_MISMATCH",
      message: "CSRF token validation failed",
    });
  }

  return next();
};
