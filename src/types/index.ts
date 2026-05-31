export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  hasStock?: boolean;
  stockCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // We'll map this to standard Lucide icons
}

export interface OrderItem extends Product {
  quantity: number;
  notes?: string;
  addedAt?: number;
  addedBy?: {
    id: string;
    name: string;
  };
}

export interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

export interface Firm {
  id: string;
  name: string;
  licenseKey: string;
  isActive: boolean;
  adminEmail: string;
  createdAt: number;
  plan: 'basic' | 'pro' | 'enterprise' | 'qr';
  slug?: string;
  licenseStartDate?: number;
  licenseEndDate?: number;
  modules?: string[];
}

export interface AppUser {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'waiter' | 'cashier';
  modules?: string[];
}

export interface RestaurantInfo {
  id?: string;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  instagram: string;
  twitter: string;
  facebook: string;
  tiktok: string;
  wifiSsid?: string;
  wifiPassword?: string;
}