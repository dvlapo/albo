import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { GuestAlbumPage } from "./pages/GuestAlbumPage";
import { AuthPage } from "./pages/auth/AuthPage";
import { AlbumSettingsPage } from "./pages/studio/AlbumSettingsPage";
import { AlbumWorkshopPage } from "./pages/studio/AlbumWorkshopPage";
import { NewAlbumPage } from "./pages/studio/NewAlbumPage";
import { SharePage } from "./pages/studio/SharePage";
import { StudioPage } from "./pages/studio/StudioPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./ui/AppShell";

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route path="/albums/:token" element={<GuestAlbumPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/studio/albums/new" element={<NewAlbumPage />} />
        <Route path="/studio/albums/:albumId" element={<AlbumWorkshopPage />} />
        <Route path="/studio/albums/:albumId/share" element={<SharePage />} />
        <Route path="/studio/albums/:albumId/settings" element={<AlbumSettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<main className="guest-state"><h1>That page slipped out of the album.</h1><a href="/">Return home</a></main>} />
  </Routes>;
}
