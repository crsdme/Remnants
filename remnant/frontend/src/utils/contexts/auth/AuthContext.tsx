import { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { setupAxiosInterceptors } from '@/api/instance';
import { App } from 'antd';
import { useRefreshToken, useAuthLogin, useAuthLogout } from '@/api/hooks';

interface AuthState {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  user: User | null;
}

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  state: AuthState;
  dispatch: (state) => void;
  login: (state) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        isAuthChecked: true
      };
    case 'REFRESH':
      return {
        isAuthenticated: true,
        isAuthChecked: true
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        isAuthChecked: true
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isAuthChecked: false,
    user: null
  });
  const { notification } = App.useApp();

  const useQueryRefreshToken = useRefreshToken({
    options: {
      refetchOnWindowFocus: false,
      enabled: false,
      retry: 0
    }
  });

  const useMutateAuthLogin = useAuthLogin({
    options: {
      onSuccess: () => {
        dispatch({ type: 'LOGIN' });
      }
    }
  });

  const useMutateAuthLogout = useAuthLogout({
    options: {
      onSuccess: () => {
        dispatch({ type: 'LOGOUT' });
      }
    }
  });

  const login = (value) => {
    useMutateAuthLogin.mutate(value);
  };

  const refresh = () => {
    useQueryRefreshToken
      .refetch()
      .then(({ status }) => status === 'success' && dispatch({ type: 'REFRESH' }));
  };

  const logout = () => {
    useMutateAuthLogout.mutate();
  };

  const sendNotification = (data) => {
    notification.error(data);
  };

  setupAxiosInterceptors({
    logout,
    refresh,
    notification: sendNotification
  });

  useEffect(() => {
    refresh();
  }, []);

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext - AuthContext');
  }
  return context;
};
