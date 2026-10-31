"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getProductPrimaryImage } from "@/lib/utils/productImages";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("uk_cart_items");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("uk_cart_items", JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    const productId = product.id || product.firestoreId || product.item_id;
    const productName = product.name || product.item_name || "Kitchen Utensil";
    const productPrice = typeof product.price === "number" ? product.price : parseInt(product.price || 0, 10);
    const productBrand = product.brand || "UtensilKart";
    const productImage = getProductPrimaryImage(product);

    setItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          id: productId,
          name: productName,
          brand: productBrand,
          price: productPrice,
          image: productImage,
          quantity: qty,
        },
      ];
    });

    // Auto open cart drawer on add so user sees feedback immediately
    setIsOpen(true);
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  // Backward compatibility alias for existing code calling incrementCart
  const incrementCart = (product) => {
    if (product && typeof product === "object") {
      addToCart(product, 1);
    } else {
      // Dummy add if no product object provided
      setItems((prev) => {
        const dummyId = "item-" + Date.now();
        return [
          ...prev,
          {
            id: dummyId,
            name: "Stainless Steel Cookware",
            brand: "UtensilKart",
            price: 899,
            image: "https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=500&h=500&fit=crop&auto=format",
            quantity: 1,
          },
        ];
      });
      setIsOpen(true);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        incrementCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
