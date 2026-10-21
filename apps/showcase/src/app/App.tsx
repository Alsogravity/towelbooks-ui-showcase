import { BrowserRouter, Route, Routes } from 'react-router';
import { I18nProvider } from '../i18n';
import { DemoProvider } from '../demo/DemoContext';
import { PortfolioNotice } from './PortfolioNotice';
import { ShowcaseShell } from './ShowcaseShell';
import { GuestLandingPage } from '../pages/GuestLandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CatalogPage } from '../pages/CatalogPage';
import { BookDetailPage } from '../pages/BookDetailPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { RoomsPage } from '../pages/RoomsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { StatesPage } from '../pages/StatesPage';
import { AuthPreviewPage } from '../pages/AuthPreviewPage';
import { PricingPage } from '../pages/pricing/PricingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
export function App() {
  return (
    <I18nProvider>
      <DemoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuestLandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/preview/auth" element={<AuthPreviewPage />} />
            <Route path="/demo" element={<ShowcaseShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="catalog/:bookId" element={<BookDetailPage />} />
              <Route path="library" element={<CatalogPage library />} />
              <Route path="library/:bookId" element={<BookDetailPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route
                path="collections/:collectionId"
                element={<CollectionsPage />}
              />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="rooms/:roomId" element={<RoomsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="states" element={<StatesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <PortfolioNotice />
        </BrowserRouter>
      </DemoProvider>
    </I18nProvider>
  );
}
