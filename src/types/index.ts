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
}

export interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

export interface AppUser {
  id: string;
  username: string;
  password?: string; // Storing password securely is crucial usually, but here we just store plain text perhaps or handle accordingly as per request? The user asked to add user and password. Wait, Firebase auth doesn't let us see user passwords, maybe they want to create custom users in firestore. We will store password in firestore for this simple case or just manage them? Let's write them in firestore since it's an "ayarlar kısmına bir de kullanıcı bölümü ekle. buradan kullanıcı ve şifresi tanımlansın. yine aynı şekilde firebaseden çeksin ve eklesin verileri".
  role?: string;
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