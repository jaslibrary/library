import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/ui/Header';
import { BottomNav } from './components/ui/BottomNav';
import { HomeView } from './views/HomeView';
import { MobileAddBook } from './views/MobileAddBook';
import { SearchView } from './views/SearchView';
import { WishlistView } from './views/WishlistView';
import { StatsView } from './views/StatsView';

const queryClient = new QueryClient();

// MainLayout with Header and BottomNav

// MainLayout with Header and BottomNav
const MainLayout = () => {
  return (
    <div className="min-h-[100dvh] bg-warm-beige pb-24 top-0">
      <Header />
      <main className="transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomeView />} />
            <Route path="search" element={<SearchView />} />
            <Route path="wishlist" element={<WishlistView />} />
            <Route path="stats" element={<StatsView />} />
          </Route>
          <Route path="/add" element={<MobileAddBook />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
