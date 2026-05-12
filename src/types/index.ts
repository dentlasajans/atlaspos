export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // We'll map this to standard Lucide icons
}

export interface OrderItem extends Product {
  quantity: number;
  notes?: string;
}

export interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}
