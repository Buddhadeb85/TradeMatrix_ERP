import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/inventory";
const POS_BASE_URL = "http://localhost:5000/api/pos";
const REPORTS_BASE_URL = "http://localhost:5000/api/reports";
const CUSTOMERS_BASE_URL = "http://localhost:5000/api/customers";
const FINANCES_BASE_URL = "http://localhost:5000/api/finances";
const SUPPLIERS_BASE_URL = "http://localhost:5000/api/suppliers";
const STAFF_BASE_URL = "http://localhost:5000/api/staff";
const ACCOUNTING_BASE_URL = "http://localhost:5000/api/accounting";

export interface Category { id: number; name: string; isActive: boolean; }
export interface Product { id: number; name: string; sku?: string; barcode?: string; categoryId: number; category: Category; unit: string; costPrice: number; sellingPrice: number; gstRate: number; lowStockLevel: number; currentStock: number; isLowStock: boolean; }
export interface Customer { id: number; name: string; phone: string; address?: string; creditLimit: number; currentDue: number; }
export interface Supplier { id: number; name: string; phone: string; companyName?: string; currentDue: number; purchases?: any[]; }
export interface Staff { id: number; name: string; phone: string; role: string; monthlySalary: number; attendances?: any[]; payrolls?: any[]; }
export interface Bill { id: number; billNumber: string; totalAmount: number; taxAmount: number; paymentMethod: string; createdAt: string; customer?: Customer; items: any[]; }
export interface Expense { id: number; category: string; amount: number; paidTo: string; notes?: string; date: string; }
export interface Liability { id: number; lenderName: string; totalAmount: number; outstanding: number; interestRate: number; monthlyEMI: number; startDate: string; status: string; }

export const getCategories = async () => (await axios.get<Category[]>(`${API_BASE_URL}/categories`)).data;
export const createCategory = async (name: string) => (await axios.post(`${API_BASE_URL}/categories`, { name })).data;
export const getProducts = async (search?: string, categoryId?: number, lowStock?: boolean) => {
  const params: any = {};
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  if (lowStock) params.lowStock = lowStock;
  return (await axios.get<Product[]>(`${API_BASE_URL}/products`, { params })).data;
};
export const createProduct = async (productData: any) => (await axios.post<Product>(`${API_BASE_URL}/products`, productData)).data;
export const adjustStock = async (productId: number, data: any) => (await axios.post(`${API_BASE_URL}/products/${productId}/stock-adjustments`, data)).data;

export const checkoutCart = async (items: any[], paymentMethod: string, customerId?: number, reference?: string, walkinName?: string, walkinPhone?: string) => (await axios.post(`${POS_BASE_URL}/checkout`, { items, paymentMethod, customerId, reference, walkinName, walkinPhone })).data;
export const getBills = async () => (await axios.get<Bill[]>(`${POS_BASE_URL}/bills`)).data;
export const getReportSummary = async () => (await axios.get(`${REPORTS_BASE_URL}/summary`)).data;
export const getTaxFilingReport = async () => (await axios.get(`${REPORTS_BASE_URL}/tax-filing`)).data;
export const getFinancialStatements = async () => (await axios.get(`${ACCOUNTING_BASE_URL}/statements`)).data;

export const getCustomers = async () => (await axios.get<Customer[]>(`${CUSTOMERS_BASE_URL}`)).data;
export const createCustomer = async (data: any) => (await axios.post(`${CUSTOMERS_BASE_URL}`, data)).data;
export const recordCustomerPayment = async (customerId: number, data: any) => (await axios.post(`${CUSTOMERS_BASE_URL}/${customerId}/payment`, data)).data;

export const getSuppliers = async () => (await axios.get<Supplier[]>(`${SUPPLIERS_BASE_URL}`)).data;
export const createSupplier = async (data: any) => (await axios.post(`${SUPPLIERS_BASE_URL}`, data)).data;
export const recordPurchase = async (data: any) => (await axios.post(`${SUPPLIERS_BASE_URL}/purchase`, data)).data;
export const settleSupplierPayment = async (supplierId: number, data: any) => (await axios.post(`${SUPPLIERS_BASE_URL}/${supplierId}/payment`, data)).data;

export const getStaff = async () => (await axios.get<Staff[]>(`${STAFF_BASE_URL}`)).data;
export const createStaff = async (data: any) => (await axios.post(`${STAFF_BASE_URL}`, data)).data;
export const markAttendance = async (data: any) => (await axios.post(`${STAFF_BASE_URL}/attendance`, data)).data;
export const processPayroll = async (data: any) => (await axios.post(`${STAFF_BASE_URL}/payroll`, data)).data;

export const getExpenses = async () => (await axios.get<Expense[]>(`${FINANCES_BASE_URL}/expenses`)).data;
export const createExpense = async (data: any) => (await axios.post(`${FINANCES_BASE_URL}/expenses`, data)).data;
export const getLiabilities = async () => (await axios.get<Liability[]>(`${FINANCES_BASE_URL}/liabilities`)).data;
export const createLiability = async (data: any) => (await axios.post(`${FINANCES_BASE_URL}/liabilities`, data)).data;
export const payLiabilityEMI = async (id: number, paymentAmount: number) => (await axios.post(`${FINANCES_BASE_URL}/liabilities/${id}/pay-emi`, { paymentAmount })).data;

export interface Business {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  gstin?: string;
}

// Automatically attach active business ID header to all outgoing requests
axios.interceptors.request.use((config) => {
  const activeBusinessId = localStorage.getItem("activeBusinessId") || "1";
  config.headers["x-business-id"] = activeBusinessId;
  return config;
});

export const getBusinesses = async () => {
  const res = await axios.get<Business[]>("http://localhost:5000/api/businesses");
  return res.data;
};

export const createBusiness = async (data: any) => {
  const res = await axios.post<Business>("http://localhost:5000/api/businesses", data);
  return res.data;
};

