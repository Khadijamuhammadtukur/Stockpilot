import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('stockpilot_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('stockpilot_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addToCart = (product, quantity = 1, variation = null) => {
    if (product.stock <= 0) {
      showToast(`'${product.name}' is currently out of stock and cannot be added.`, 'error');
      return false;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.variation?.id === variation?.id);
      const currentQtyInCart = existingIndex > -1 ? prev[existingIndex].quantity : 0;
      const newQty = currentQtyInCart + quantity;

      if (newQty > product.stock) {
        showToast(`Cannot add more units. Max available stock is ${product.stock}.`, 'warning');
        return prev;
      }

      showToast(`Added '${product.name}' to cart!`);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [...prev, { product, quantity, variation }];
      }
    });
    return true;
  };

  const updateQuantity = (productId, variationId, newQty) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.variation?.id === variationId) {
          if (newQty > item.product.stock) {
            showToast(`Max available stock is ${item.product.stock}`, 'warning');
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId, variationId) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.variation?.id === variationId)));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.variation?.selling_price || item.product.selling_price;
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      itemCount,
      toast,
      showToast
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
