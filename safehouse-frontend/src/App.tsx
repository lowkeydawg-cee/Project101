import { Switch, Route } from 'wouter'
import { NavBar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Shop } from '@/pages/Shop'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { CustomQuote } from '@/pages/CustomQuote'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { CartProvider } from '@/context/CartContext'

function App() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-void text-ink">
        <NavBar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/shop" component={Shop} />
            <Route path="/shop/:slug" component={ProductDetail} />
            <Route path="/cart" component={Cart} />
            <Route path="/custom" component={CustomQuote} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App
