import React from 'react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col justify-between text-neutral-100">
        <div>
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-mono uppercase tracking-wider">Your Cart</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white font-mono text-sm"
            >
              [CLOSE]
            </button>
          </div>

          <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-neutral-500 font-mono text-sm py-8 text-center">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center border border-neutral-800 p-4 bg-neutral-900/50">
                  <div>
                    <h4 className="font-mono text-sm uppercase">{item.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">${item.price} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-neutral-700">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-xs hover:bg-neutral-800"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-xs hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-mono"
                    >
                      [REMOVE]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4 font-mono text-sm">
            <span>TOTAL:</span>
            <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            className="w-full bg-white text-black font-mono uppercase py-3 font-bold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => alert('Checkout flow triggered!')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}