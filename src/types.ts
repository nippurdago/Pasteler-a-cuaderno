export type View = 'dashboard' | 'addSale' | 'addExpense' | 'products' | 'summary' | 'expenseDetail' | 'productCategories' | 'incomeDetail';

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  isVisible: boolean;
  sortOrder: number;
  category_id?: string;
}

export type TransactionType = 'sale' | 'expense';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export enum ExpenseCategory {
  SUPPLIES_PACKAGING = 'Insumos y Empaques',
  UTILITIES = 'Servicios Públicos',
  SALARIES = 'Sueldos y Personal',
  RENT_MAINTENANCE = 'Alquiler y Mantenimiento',
  MARKETING_SALES = 'Marketing y Ventas',
  ADMIN_OTHER = 'Administrativos y Otros',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  description?: string;
  items?: SaleItem[]; // For sales
  category?: ExpenseCategory; // For expenses
}

export interface ChartDataPoint {
  date: string;
  Ingresos: number;
  Gastos: number;
  Balance: number;
}