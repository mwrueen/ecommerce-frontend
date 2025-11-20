import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image_url?: string;
  slug: string;
}

interface CouponData {
  code: string;
  discount_amount: number;
  subtotal: number;
  total_after_discount: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  coupon: CouponData | null;
}

const loadCart = (): CartItem[] => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
};

const loadCoupon = (): CouponData | null => {
  const saved = localStorage.getItem('cart_coupon');
  return saved ? JSON.parse(saved) : null;
};

const initialState: CartState = {
  items: loadCart(),
  total: 0,
  coupon: loadCoupon(),
};

initialState.total = calculateTotal(initialState.items);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.total = calculateTotal(state.items);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.coupon = null;
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_coupon');
    },
    applyCoupon: (state, action: PayloadAction<CouponData>) => {
      state.coupon = action.payload;
      localStorage.setItem('cart_coupon', JSON.stringify(action.payload));
    },
    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.removeItem('cart_coupon');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export type { CouponData };
export default cartSlice.reducer;
