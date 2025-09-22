import type { Product, ProductCategory } from './types';
import { ExpenseCategory } from './types';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'cat_dul', name: 'Dulces' },
  { id: 'cat_sal', name: 'Salados' },
  { id: 'cat_beb', name: 'Bebidas' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Torta Chocolate', price: 45, isVisible: true, sortOrder: 1, category_id: 'cat_dul' },
  { id: 'prod2', name: 'Cupcakes x6', price: 30, isVisible: true, sortOrder: 2, category_id: 'cat_dul' },
  { id: 'prod3', name: 'Brownies x4', price: 20, isVisible: true, sortOrder: 3, category_id: 'cat_dul' },
  { id: 'prod4', name: 'Tartaletas x3', price: 25, isVisible: true, sortOrder: 4, category_id: 'cat_dul' },
  { id: 'prod5', name: 'Pan de ajo', price: 15, isVisible: true, sortOrder: 5, category_id: 'cat_sal' },
  { id: 'prod6', name: 'Jugo de Naranja', price: 8, isVisible: true, sortOrder: 6, category_id: 'cat_beb' },
  { id: 'prod7', name: 'Cheesecake', price: 50, isVisible: false, sortOrder: 7, category_id: 'cat_dul' },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.SUPPLIES_PACKAGING,
  ExpenseCategory.UTILITIES,
  ExpenseCategory.SALARIES,
  ExpenseCategory.RENT_MAINTENANCE,
  ExpenseCategory.MARKETING_SALES,
  ExpenseCategory.ADMIN_OTHER,
];
