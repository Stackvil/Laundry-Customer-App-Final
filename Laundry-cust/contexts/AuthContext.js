import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (mobileNumber, password) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ mobileNumber, name: `User ${mobileNumber.slice(-4)}` });
      setIsLoading(false);
    }, 1000);
  };

  const signup = async (name, email, password, mobileNumber, address) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({ email, name, mobileNumber, address });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (name, email, mobileNumber, address, profileImage) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser((prevUser) => ({
          ...prevUser,
          name: name || prevUser?.name,
          email: email || prevUser?.email,
          mobileNumber: mobileNumber || prevUser?.mobileNumber,
          address: address || prevUser?.address,
          profileImage: profileImage || prevUser?.profileImage,
        }));
        setIsLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, you would verify the current password with the backend
        // For now, we'll just simulate success
        if (currentPassword && newPassword) {
          setIsLoading(false);
          resolve(true);
        } else {
          setIsLoading(false);
          reject(new Error('Failed to change password'));
        }
      }, 1000);
    });
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: isAuthenticated(),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

