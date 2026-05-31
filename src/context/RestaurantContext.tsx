import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Category, Product, AppUser, RestaurantInfo } from '../types';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { CATEGORIES as INITIAL_CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../data/mock';

export interface Section {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  sectionId: string;
}

interface RestaurantContextType {
  firmId?: string;
  firmData?: Firm | null;
  sections: Section[];
  tables: Table[];
  categories: Category[];
  products: Product[];
  appUsers: AppUser[];
  restaurantInfo: RestaurantInfo | null;
  addSection: (name: string) => void;
  deleteSection: (id: string) => void;
  addTable: (name: string, sectionId: string) => void;
  deleteTable: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addAppUser: (user: Omit<AppUser, 'id'>) => void;
  updateAppUser: (id: string, user: Partial<AppUser>) => void;
  deleteAppUser: (id: string) => void;
  updateRestaurantInfo: (info: RestaurantInfo) => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const RestaurantProvider = ({ children, firmId, firmData }: { children: ReactNode, firmId?: string, firmData?: Firm | null }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync data
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const setupSubscriptions = () => {
      if (!firmId) return;

      setSections([]);
      setTables([]);
      setCategories([]);
      setProducts([]);
      setAppUsers([]);
      setRestaurantInfo(null);
      setIsInitializing(true);

      const unsubscribeSections = onSnapshot(collection(db, 'firms', firmId, 'sections'), (snapshot) => {
        setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Section)));
      }, error => {
         console.error('sections error', error);
      });
      unsubscribes.push(unsubscribeSections);

      const unsubscribeTables = onSnapshot(collection(db, 'firms', firmId, 'tables'), (snapshot) => {
        setTables(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Table)));
      }, error => {
         console.error('tables error', error);
      });
      unsubscribes.push(unsubscribeTables);

      const unsubscribeCategories = onSnapshot(collection(db, 'firms', firmId, 'categories'), (snapshot) => {
        setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
      }, error => {
         console.error('categories error', error);
      });
      unsubscribes.push(unsubscribeCategories);

      const unsubscribeProducts = onSnapshot(collection(db, 'firms', firmId, 'products'), (snapshot) => {
        setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      }, error => {
         console.error('products error', error);
      });
      unsubscribes.push(unsubscribeProducts);

      const unsubscribeUsers = onSnapshot(collection(db, 'firms', firmId, 'appusers'), (snapshot) => {
        setAppUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)));
      }, error => {
         console.error('users error', error);
      });
      unsubscribes.push(unsubscribeUsers);

      const unsubscribeInfo = onSnapshot(doc(db, 'firms', firmId, 'settings', 'restaurantInfo'), (docSnap) => {
        if (docSnap.exists()) {
          setRestaurantInfo({ id: docSnap.id, ...docSnap.data() } as RestaurantInfo);
        } else {
          setRestaurantInfo(null);
        }
      }, error => {
         console.error('info error', error);
      });
      unsubscribes.push(unsubscribeInfo);

      setIsInitializing(false);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && firmId) {
        setupSubscriptions();
      } else {
        setSections([]);
        setTables([]);
        setCategories([]);
        setProducts([]);
        setAppUsers([]);
        setRestaurantInfo(null);
        setIsInitializing(true);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribes.forEach(unsub => unsub());
    };
  }, [firmId]);

  const addSection = async (name: string) => {
    if (!name.trim() || !firmId) return;
    try {
      const newRef = doc(collection(db, 'firms', firmId, 'sections'));
      await setDoc(newRef, { name: name.trim() });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'sections');
      throw e;
    }
  };
  
  const deleteSection = async (id: string) => {
    if (!firmId) return;
    try {
      await deleteDoc(doc(db, 'firms', firmId, 'sections', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'sections');
    }
  };

  const addTable = async (name: string, sectionId: string) => {
    if (!name.trim() || !firmId) return;
    try {
      const newRef = doc(collection(db, 'firms', firmId, 'tables'));
      await setDoc(newRef, { name: name.trim(), sectionId });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tables');
    }
  };
  
  const deleteTable = async (id: string) => {
    if (!firmId) return;
    try {
      await deleteDoc(doc(db, 'firms', firmId, 'tables', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'tables');
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!firmId) return;
    try {
      const newRef = doc(collection(db, 'firms', firmId, 'categories'));
      await setDoc(newRef, { name: category.name, icon: category.icon });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'categories');
    }
  };

  const updateCategory = async (id: string, name: string, icon: string) => {
    if (!firmId) return;
    try {
       await updateDoc(doc(db, 'firms', firmId, 'categories', id), { name, icon });
    } catch (e) {
       handleFirestoreError(e, OperationType.UPDATE, 'categories');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!firmId) return;
    try {
       await deleteDoc(doc(db, 'firms', firmId, 'categories', id));
    } catch (e) {
       handleFirestoreError(e, OperationType.DELETE, 'categories');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firmId) return;
    try {
      const newRef = doc(collection(db, 'firms', firmId, 'products'));
      await setDoc(newRef, { 
        name: product.name, 
        description: product.description || '', 
        price: product.price, 
        image: product.image, 
        categoryId: product.categoryId,
        hasStock: product.hasStock || false,
        stockCount: product.stockCount || 0
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    if (!firmId) return;
    try {
      await updateDoc(doc(db, 'firms', firmId, 'products', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!firmId) return;
    try {
       await deleteDoc(doc(db, 'firms', firmId, 'products', id));
    } catch (e) {
       handleFirestoreError(e, OperationType.DELETE, 'products');
    }
  };

  const addAppUser = async (user: Omit<AppUser, 'id'>) => {
    if (!firmId) return;
    try {
      const newRef = doc(collection(db, 'firms', firmId, 'appusers'));
      await setDoc(newRef, user);
    } catch (e) {
      console.error(e);
      alert("Personel eklenemedi: " + (e instanceof Error ? e.message : String(e)));
      handleFirestoreError(e, OperationType.CREATE, 'appusers');
    }
  };

  const updateAppUser = async (id: string, user: Partial<AppUser>) => {
    if (!firmId) return;
    try {
      await updateDoc(doc(db, 'firms', firmId, 'appusers', id), user);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'appusers');
    }
  };

  const deleteAppUser = async (id: string) => {
    if (!firmId) return;
    try {
      await deleteDoc(doc(db, 'firms', firmId, 'appusers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'appusers');
    }
  };

  const updateRestaurantInfo = async (info: RestaurantInfo) => {
    if (!firmId) return;
    try {
      await setDoc(doc(db, 'firms', firmId, 'settings', 'restaurantInfo'), info, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings');
    }
  };

  return (
    <RestaurantContext.Provider value={{
      firmId, firmData, 
      sections, tables, categories, products, appUsers, restaurantInfo,
      addSection, deleteSection, addTable, deleteTable,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      addAppUser, updateAppUser, deleteAppUser,
      updateRestaurantInfo
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
