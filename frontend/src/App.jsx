import { Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WardrobePage from "./pages/WardrobePage";
import OutfitCreatorPage from "./pages/OutfitCreatorPage";
import OutfitsPage from "./pages/OutfitsPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPage from "./pages/PrivacyPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/wardrobe"
            element={
              <ProtectedRoute>
                <WardrobePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outfits/new"
            element={
              <ProtectedRoute>
                <OutfitCreatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outfits"
            element={
              <ProtectedRoute>
                <OutfitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
