import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Location state
  const [location, setLocation] = useState(null); // [lat, lng]
  const [locationError, setLocationError] = useState('');

  // Request location function
  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
        setLocationError('');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Could not get your location. Using default location.');
        } else {
          setLocationError('Could not get your location. Using default location.');
        }
      }
    );
  }

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function updateUserProfile(displayName) {
    return updateProfile(auth.currentUser, { displayName });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    location,
    locationError,
    requestLocation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}