import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { NavBar } from '@/components/NavBar';
import { Shop } from "./pages/Shop";
export function App() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-void text-ink">
        <NavBar />
        <main className="flex-1">
          <Shop />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

export default App;