import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartDrawer } from '@/components/CartDrawer'
import { Footer } from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { Route, Switch } from 'wouter'
import { Home } from '@/pages/Home'
import { Shop } from '@/pages/Shop'
import { ProductDetail } from '@/pages/ProductDetail'
import { CustomQuote } from '@/pages/CustomQuote'
import { Cart } from '@/pages/Cart'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { AdminLogin } from '@/pages/Admin/Login'
import { AdminDashboard } from '@/pages/Admin/Dashboard'
import { AdminOrders } from '@/pages/AdminOrders'
import { RequireAuth } from '@/components/RequireAuth'
import { OrderStatus } from '@/pages/OrderStatus'
import Checkout from '@/pages/Checkout'
export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-void text-ink">
          <NavBar />
          <main className="flex-1">
            <Switch>
              {/* Order status */}
              <Route path="/order-status" component={OrderStatus} />
              {/* Home */}
              <Route path="/" component={Home} />
              {/* Storefront */}
              <Route path="/shop" component={Shop} />
              <Route path="/shop/:slug" component={ProductDetail} />
              {/* Custom fabrication */}
              <Route path="/custom-quote" component={CustomQuote} />
              {/* Cart */}
              <Route path="/cart" component={Cart} />
              {/* Checkout */}
              <Route path="/checkout" component={Checkout} />
              {/* Information */}
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              {/* Admin login */}
              <Route path="/admin/login" component={AdminLogin} />
              {/* Admin dashboard */}
              <Route path="/admin">
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              </Route>
              {/* Admin orders */}
              <Route path="/admin/orders">
                <RequireAuth>
                  <AdminOrders />
                </RequireAuth>
              </Route>
              {/* 404 */}
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}