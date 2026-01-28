import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase/firebaseConfig';
import { doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist from Firestore
  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const wishlistRef = doc(db, 'wishlists', user.uid);
        const wishlistSnap = await getDoc(wishlistRef);
        
        if (wishlistSnap.exists()) {
          setWishlistItems(wishlistSnap.data().items || []);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      console.warn('User must be logged in to use wishlist');
      return;
    }

    try {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const isInWishlist = wishlistItems.find(item => item.id === product.id);

      if (isInWishlist) {
        // Remove from wishlist
        await updateDoc(wishlistRef, {
          items: arrayRemove(isInWishlist)
        });
        setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
      } else {
        // Add to wishlist
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          addedAt: new Date().toISOString()
        };

        // Create or update wishlist
        const wishlistSnap = await getDoc(wishlistRef);
        if (!wishlistSnap.exists()) {
          // Create new wishlist
          await setDoc(wishlistRef, {
            userId: user.uid,
            items: [wishlistItem],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Update existing wishlist
          await updateDoc(wishlistRef, {
            items: arrayUnion(wishlistItem),
            updatedAt: new Date().toISOString()
          });
        }

        setWishlistItems([...wishlistItems, wishlistItem]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      await deleteDoc(wishlistRef);
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
