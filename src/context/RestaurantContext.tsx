import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Category, Product } from '../types';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
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
  sections: Section[];
  tables: Table[];
  categories: Category[];
  products: Product[];
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
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync data
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const unsubscribeSections = onSnapshot(collection(db, 'sections'), (snapshot) => {
      setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Section)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'sections'));
    unsubscribes.push(unsubscribeSections);

    const unsubscribeTables = onSnapshot(collection(db, 'tables'), (snapshot) => {
      setTables(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Table)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'tables'));
    unsubscribes.push(unsubscribeTables);

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'categories'));
    unsubscribes.push(unsubscribeCategories);

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'products'));
    unsubscribes.push(unsubscribeProducts);

    setIsInitializing(false);

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const addSection = async (name: string) => {
    if (!name.trim()) return;
    try {
      const newRef = doc(collection(db, 'sections'));
      await setDoc(newRef, { name: name.trim() });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'sections');
      throw e;
    }
  };
  
  const deleteSection = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sections', id));
      // Optionally delete related tables
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'sections');
    }
  };

  const addTable = async (name: string, sectionId: string) => {
    if (!name.trim()) return;
    try {
      const newRef = doc(collection(db, 'tables'));
      await setDoc(newRef, { name: name.trim(), sectionId });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'tables');
    }
  };
  
  const deleteTable = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tables', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'tables');
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newRef = doc(collection(db, 'categories'));
      await setDoc(newRef, { name: category.name, icon: category.icon });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'categories');
    }
  };

  const updateCategory = async (id: string, name: string, icon: string) => {
    try {
       await updateDoc(doc(db, 'categories', id), { name, icon });
    } catch (e) {
       handleFirestoreError(e, OperationType.UPDATE, 'categories');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
       await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
       handleFirestoreError(e, OperationType.DELETE, 'categories');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newRef = doc(collection(db, 'products'));
      await setDoc(newRef, { 
        name: product.name, 
        description: product.description || '', 
        price: product.price, 
        image: product.image, 
        categoryId: product.categoryId 
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
       await deleteDoc(doc(db, 'products', id));
    } catch (e) {
       handleFirestoreError(e, OperationType.DELETE, 'products');
    }
  };

  return (
    <RestaurantContext.Provider value={{ 
      sections, tables, categories, products, 
      addSection, deleteSection, addTable, deleteTable,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct
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
