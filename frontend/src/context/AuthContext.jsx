import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('fdm_token');
    const savedUser = localStorage.getItem('fdm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fdm_token', data.token);
    localStorage.setItem('fdm_user', JSON.stringify(data));
    return data;
  };

  const registerDonor = async (formData) => {
    const { data } = await API.post('/auth/register/donor', formData);
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fdm_token', data.token);
    localStorage.setItem('fdm_user', JSON.stringify(data));
    return data;
  };

  const registerReceiver = async (formData) => {
    const { data } = await API.post('/auth/register/receiver', formData);
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fdm_token', data.token);
    localStorage.setItem('fdm_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fdm_token');
    localStorage.removeItem('fdm_user');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('fdm_user', JSON.stringify(updatedData));
    if (updatedData.token) {
      setToken(updatedData.token);
      localStorage.setItem('fdm_token', updatedData.token);
    }
  };

  const googleLogin = async (token, role) => {
    const { data } = await API.post('/auth/google', { token, role });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fdm_token', data.token);
    localStorage.setItem('fdm_user', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerDonor,
        registerReceiver,
        googleLogin,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
