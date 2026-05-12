import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category, Product } from '../types';
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
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Teras' },
    { id: '2', name: 'Bahçe' },
    { id: '3', name: 'İç Salon' },
  ]);

  const [tables, setTables] = useState<Table[]>([
    { id: 't1', name: 'Masa 1', sectionId: '1' },
    { id: 't2', name: 'Masa 2', sectionId: '1' },
    { id: 't3', name: 'Masa 3', sectionId: '1' },
    { id: 't4', name: 'Masa 4', sectionId: '2' },
    { id: 't5', name: 'Masa 5', sectionId: '2' },
    { id: 't6', name: 'Masa 6', sectionId: '3' },
    { id: 't7', name: 'Masa 7', sectionId: '3' },
  ]);

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const addSection = (name: string) => {
    if (!name.trim()) return;
    setSections(prev => [...prev, { id: Date.now().toString(), name: name.trim() }]);
  };
  
  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    setTables(prev => prev.filter(t => t.sectionId !== id));
  };

  const addTable = (name: string, sectionId: string) => {
    if (!name.trim()) return;
    setTables(prev => [...prev, { id: Date.now().toString(), name: name.trim(), sectionId }]);
  };
  
  const deleteTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
  };

  const updateCategory = (id: string, name: string, icon: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, icon } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.filter(p => p.categoryId !== id));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
