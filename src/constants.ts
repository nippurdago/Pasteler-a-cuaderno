import type { Product } from './types';
import { ExpenseCategory } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Torta Chocolate', price: 45, isVisible: true, sortOrder: 1 },
  { id: 'prod2', name: 'Cupcakes x6', price: 30, isVisible: true, sortOrder: 2 },
  { id: 'prod3', name: 'Brownies x4', price: 20, isVisible: true, sortOrder: 3 },
  { id: 'prod4', name: 'Tartaletas x3', price: 25, isVisible: true, sortOrder: 4 },
  { id: 'prod5', name: 'Pan dulce', price: 15, isVisible: true, sortOrder: 5 },
  { id: 'prod6', name: 'Cookies x12', price: 18, isVisible: true, sortOrder: 6 },
  { id: 'prod7', name: 'Cheesecake', price: 50, isVisible: false, sortOrder: 7 },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.SUPPLIES_PACKAGING,
  ExpenseCategory.UTILITIES,
  ExpenseCategory.SALARIES,
  ExpenseCategory.RENT_MAINTENANCE,
  ExpenseCategory.MARKETING_SALES,
  ExpenseCategory.ADMIN_OTHER,
];
