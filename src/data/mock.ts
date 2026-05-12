import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'starters', name: 'Başlangıçlar', icon: 'Soup' },
  { id: 'mains', name: 'Ana Yemekler', icon: 'UtensilsCrossed' },
  { id: 'steaks', name: 'Izgara & Steak', icon: 'Beef' },
  { id: 'drinks', name: 'İçecekler', icon: 'Wine' },
  { id: 'desserts', name: 'Tatlılar', icon: 'Cake' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Fırınlanmış Kuşkonmaz',
    description: 'Taze parmesan ve trüf yağı ile fırınlanmış mevsim kuşkonmazı',
    price: 320,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    categoryId: 'starters',
  },
  {
    id: 'p2',
    name: 'Dana Carpaccio',
    description: 'İnce dilimlenmiş bonfile, roka, parmesan ve hardal sos',
    price: 450,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
    categoryId: 'starters',
  },
  {
    id: 'p3',
    name: 'Trio Deniz Mahsulleri',
    description: 'Kalamar, karides ve midye tava, özel tartar sos eşliğinde',
    price: 550,
    image: 'https://images.unsplash.com/photo-1599084942859-009772b22bb8?auto=format&fit=crop&w=400&q=80',
    categoryId: 'starters',
  },
  {
    id: 'p4',
    name: 'Özel Risotto',
    description: 'Porçini mantarı, trüf krema sos ve yıllanmış parmesan',
    price: 680,
    image: 'https://images.unsplash.com/photo-1633337474564-1d9bf896cc8d?auto=format&fit=crop&w=400&q=80',
    categoryId: 'mains',
  },
  {
    id: 'p5',
    name: 'Somon Izgara',
    description: 'Limonlu tereyağı sosu ve sote edilmiş mevsim sebzeleri ile',
    price: 850,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
    categoryId: 'mains',
  },
  {
    id: 'p6',
    name: 'Dallas Steak (700g)',
    description: '28 gün dinlendirilmiş, firınlanmış sarımsak ve biberiye ile',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=400&q=80',
    categoryId: 'steaks',
  },
  {
    id: 'p7',
    name: 'Cheesecake',
    description: 'Özel orman meyveli sos ile New York usulü',
    price: 280,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80',
    categoryId: 'desserts',
  },
  {
    id: 'p8',
    name: 'Signature Kokteyl',
    description: 'Çarkıfelek meyvesi, misket limonu ve özel distile şurup',
    price: 420,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80',
    categoryId: 'drinks',
  },
];
