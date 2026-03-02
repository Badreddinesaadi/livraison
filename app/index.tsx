import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { auth } from "../firebase";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // ⏳ Loader visible 5 secondes
      setLoading(true);

      setTimeout(() => {
        setUser(currentUser);
        setLoading(false);
      }, 5000);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <Loader />;
  }

  return !user ? <HomeScreen /> : <LoginScreen />;
}
