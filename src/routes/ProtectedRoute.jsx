import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "../utils/auth";
import { getMe } from "../services/auth.api";

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  const token = getToken();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }

    // Verify token is valid
    getMe()
      .then(() => setIsValid(true))
      .catch(() => {
        clearToken();
        setIsValid(false);
      });
  }, [token]);

  if (isValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
