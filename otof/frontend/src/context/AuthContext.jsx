import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken, setLogoutHandler, setRefreshHandler } from '../services/api';

const AuthContext = createContext(null);

// Penyimpanan state auth + helper login/logout
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = localStorage.getItem('auth');
      if (!saved) return { user: null, accessToken: null };
      return JSON.parse(saved);
    } catch (err) {
      return { user: null, accessToken: null };
    }
  });
  const [loading, setLoading] = useState(false);

  const persistAuth = useCallback((nextState) => {
    setAuthState(nextState);
    if (nextState?.user && nextState?.accessToken) {
      localStorage.setItem('auth', JSON.stringify(nextState));
      setAccessToken(nextState.accessToken);
    } else {
      localStorage.removeItem('auth');
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    if (authState?.accessToken) {
      setAccessToken(authState.accessToken);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshSession = useCallback(async () => {
    const response = await api.post('/auth/refresh', null, {
      headers: { 'x-no-retry': 'true' }
    });
    const nextState = {
      user: response.data.user,
      accessToken: response.data.accessToken
    };
    persistAuth(nextState);
    return response.data.accessToken;
  }, [persistAuth]);

  useEffect(() => {
    setRefreshHandler(async () => refreshSession());
    setLogoutHandler(() => () => persistAuth({ user: null, accessToken: null }));
  }, [persistAuth, refreshSession]);

  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      try {
        const response = await api.post(
          '/auth/login',
          { username, password },
          { headers: { 'x-no-retry': 'true' } }
        );
        persistAuth({
          user: response.data.user,
          accessToken: response.data.accessToken
        });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Login gagal' };
      } finally {
        setLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', null, { headers: { 'x-no-retry': 'true' } });
    } catch (err) {
      // abaikan error
    } finally {
      persistAuth({ user: null, accessToken: null });
    }
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      user: authState?.user,
      accessToken: authState?.accessToken,
      loading,
      isAuthenticated: Boolean(authState?.user && authState?.accessToken),
      login,
      logout
    }),
    [authState, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
