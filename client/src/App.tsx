import React, { useEffect, useState } from "react";
import {
  Typography, Box, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Grid
} from "@mui/material";
import { 
  Inventory as InventoryIcon, PointOfSale as POSIcon, 
  Settings as SettingsIcon, People as CustomersIcon, AccountBalance as FinanceIcon, 
  LocalShipping as SupplierIcon, Badge as StaffIcon, Assessment as ReportIcon, 
  ReceiptLong as HistoryIcon, AccountBalanceWallet as LedgerIcon, BarChart as MISIcon,
  Logout as LogoutIcon 
} from "@mui/icons-material";
import { 
  getProducts, getCategories, checkoutCart, getBills, getReportSummary, 
  getTaxFilingReport, getFinancialStatements, getCustomers, getSuppliers, 
  getStaff, getExpenses, getLiabilities, getBusinesses, createBusiness, createCategory, createProduct, adjustStock,
  Product, Category, Bill, Customer, Supplier, Staff, Expense, Liability, Business 
} from "./services/api";
import api from "./api/axiosInstance";
import Login from "./pages/Login";
import jsPDF from "jspdf";

// Import modular component files
import { POSBillingTab } from "./components/POSBillingTab";
import { InventoryTab } from "./components/InventoryTab";
import { SalesHistoryTab } from "./components/SalesHistoryTab";
import { CustomersTab } from "./components/CustomersTab";
import { SuppliersTab } from "./components/SuppliersTab";
import { StaffPayrollTab } from "./components/StaffPayrollTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { MISTab } from "./components/MISTab";
import { LedgerTab } from "./components/LedgerTab";
import { ReportsTab } from "./components/ReportsTab";
import { SettingsTab } from "./components/SettingsTab";

const drawerWidth = 260;

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  if (!token) {
    return <Login />;
  }

  const [currentTab, setCurrentTab] = useState(0); 
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(localStorage.getItem("activeBusinessId") || "1");
  const [openBusinessDialog, setOpenBusinessDialog] = useState(false);
  const [newBusinessData, setNewBusinessData] = useState({ name: "", phone: "", address: "", gstin: "" });
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "", creditLimit: "10000" });
  const [newSupplier, setNewSupplier] = useState({ name: "", phone: "", companyName: "" });
  const [newPurchase, setNewPurchase] = useState({ supplierId: "", invoiceNumber: "", paymentType: "CREDIT", productId: "", quantity: "", costPrice: "" });
  const [newStaff, setNewStaff] = useState({ name: "", phone: "", role: "CASHIER", monthlySalary: "" });
  const [newAttendance, setNewAttendance] = useState({ staffId: "", status: "PRESENT", overtimeHrs: "0" });
  const [newPayroll, setNewPayroll] = useState({ staffId: "", month: "2026-11", baseSalary: "", deductions: "0" }); 
  const [newExpense, setNewExpense] = useState({ category: "RENT", amount: "", paidTo: "", notes: "" });
  const [newLoan, setNewLoan] = useState({ lenderName: "", totalAmount: "", interestRate: "", monthlyEMI: "" });
  const [emiAmount, setEmiAmount] = useState("");

  const [taxReport, setTaxReport] = useState<any>({ totalBillsAnalyzed: 0, taxSlabs: {} });
  const [financials, setFinancials] = useState<any>({ summary: { totalAssets: 0, totalLiabilities: 0, totalIncome: 0, totalExpenses: 0, netProfit: 0, equity: 0 }, ledgerSummary: { ASSET: [], LIABILITY: [], INCOME: [], EXPENSE: [] } });

  const [reportData, setReportData] = useState<any>({ 
    totalSalesRevenue: 0, totalTransactions: 0, inventoryCostValue: 0, lowStockCount: 0, 
    totalCustomerDue: 0, totalSupplierPayable: 0, totalOperatingExpenses: 0, totalPayrollPaid: 0, netOperatingProfit: 0,
    paymentTotals: {}, dayWiseSales: {}, monthWiseSales: {}, productWiseSales: [], categoryWiseSales: {}, customerWiseSales: {}, supplierWise: {}, expenseWise: {}, staffWise: {}
  });
  
  const [shopSettings, setShopSettings] = useState({
    shopName: "TradeMatrix ERP", 
    tagline: "Multi-Business Trading & Inventory Suite", 
    phone: "", 
    address: "", 
    gstin: "", 
    logoUrl: "",
    receiptFooter: "Thank you for doing business with us!"
  });

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  useEffect(() => {
    const savedCart = localStorage.getItem("pos_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error("Failed to load saved cart:", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_cart", JSON.stringify(cart));
  }, [cart]);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [posSearch, setPosSearch] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  
  // Dialog State Controllers
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [openSupplierPayDialog, setOpenSupplierPayDialog] = useState(false);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openPayrollDialog, setOpenPayrollDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openLoanDialog, setOpenLoanDialog] = useState(false);
  const [openEmiDialog, setOpenEmiDialog] = useState(false);

  // Form Input States for Dialogs
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", barcode: "", categoryId: "", unit: "pcs",
    costPrice: "", sellingPrice: "", gstRate: "5", lowStockLevel: "5", openingStock: "0"
  });
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: "", type: "ADD", notes: "" });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Liability | null>(null);

  const loadData = async () => {
    try {
      const bizRes = await getBusinesses();
      setBusinesses(bizRes);
      if (bizRes.length > 0 && !localStorage.getItem("activeBusinessId")) {
        localStorage.setItem("activeBusinessId", String(bizRes[0].id));
        setActiveBusinessId(String(bizRes[0].id));
      }
    } catch (e) { console.error("Businesses error:", e); }

    try { setCategories(await getCategories()); } catch (e) { console.error("Categories error:", e); }
    try { setProducts(await getProducts(search, selectedCategory === "" ? undefined : Number(selectedCategory))); } catch (e) { console.error("Products error:", e); }
    try { setBills(await getBills()); } catch (e) { console.error("Bills error:", e); }
    try { setReportData(await getReportSummary()); } catch (e) { console.error("Report summary error:", e); }
    try { setTaxReport(await getTaxFilingReport()); } catch (e) { console.error("Tax report error:", e); }
    try { setFinancials(await getFinancialStatements()); } catch (e) { console.error("Financials error:", e); }
    try { setCustomers(await getCustomers()); } catch (e) { console.error("Customers error:", e); }
    try { setSuppliers(await getSuppliers()); } catch (e) { console.error("Suppliers error:", e); }
    try { setStaffList(await getStaff()); } catch (e) { console.error("Staff error:", e); }
    try { setExpenses(await getExpenses()); } catch (e) { console.error("Expenses error:", e); }
    try { setLiabilities(await getLiabilities()); } catch (e) { console.error("Liabilities error:", e); }

    try {
      const settingsRes = await api.get("/settings");
      if (settingsRes.data) setShopSettings(settingsRes.data);
    } catch (err) { console.error("Settings error:", err); }
  };

  useEffect(() => { loadData(); }, [currentTab, search, selectedCategory, activeBusinessId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeBusinessId");
    localStorage.removeItem("pos_cart");
    // Forces instant browser reload to the login screen
    window.location.href = "/login"; 
  };

  const handleBusinessChange = (e: any) => {
    const selectedId = e.target.value;
    if (selectedId === "ADD_NEW") {
      setOpenBusinessDialog(true);
    } else {
      setActiveBusinessId(selectedId);
      localStorage.setItem("activeBusinessId", selectedId);
      loadData();
    }
  };

  const handleSaveNewBusiness = async () => {
    try {
      const res = await createBusiness(newBusinessData);
      setActiveBusinessId(String(res.id));
      localStorage.setItem("activeBusinessId", String(res.id));
      setOpenBusinessDialog(false);
      setNewBusinessData({ name: "", phone: "", address: "", gstin: "" });
      loadData();
      alert("New business created successfully!");
    } catch (err: any) { alert(err.response?.data?.error || "Failed to create business"); }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put("/settings", shopSettings);
      alert("Shop settings updated successfully!");
      loadData();
    } catch (err: any) { alert("Failed to update settings"); }
  };

  const handleSaveCategory = async () => {
    try {
      await createCategory(newCategoryName);
      setOpenCategoryDialog(false);
      setNewCategoryName("");
      loadData();
      alert("Category created successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create category");
    }
  };

  const handleSaveProduct = async () => {
    try {
      await createProduct({
        ...newProduct,
        categoryId: Number(newProduct.categoryId),
        costPrice: Number(newProduct.costPrice),
        sellingPrice: Number(newProduct.sellingPrice),
        gstRate: Number(newProduct.gstRate),
        lowStockLevel: Number(newProduct.lowStockLevel),
        currentStock: Number(newProduct.openingStock)
      });
      setOpenProductDialog(false);
      setNewProduct({ name: "", sku: "", barcode: "", categoryId: "", unit: "pcs", costPrice: "", sellingPrice: "", gstRate: "5", lowStockLevel: "5", openingStock: "0" });
      loadData();
      alert("Product added successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create product");
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct) return;
    try {
      await adjustStock(selectedProduct.id, {
        quantity: Number(stockAdjustment.quantity),
        type: stockAdjustment.type,
        notes: stockAdjustment.notes
      });
      setOpenStockDialog(false);
      setStockAdjustment({ quantity: "", type: "ADD", notes: "" });
      setSelectedProduct(null);
      loadData();
      alert("Stock adjusted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to adjust stock");
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => setCart(prev => prev.filter(item => item.product.id !== productId));
  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.product.sellingPrice) * item.quantity), 0);

  const generatePDFInvoice = (bill: Bill) => {
    const doc = new jsPDF();
    let startY = 20;

    if (shopSettings.logoUrl) {
      try {
        doc.addImage(shopSettings.logoUrl, "JPEG", 14, 12, 20, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(shopSettings.shopName || "GROCERY SHOP INVOICE", 38, 22);
        startY = 38;
      } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(shopSettings.shopName || "GROCERY SHOP INVOICE", 14, 20);
        startY = 28;
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(shopSettings.shopName || "GROCERY SHOP INVOICE", 14, 20);
      startY = 26;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(shopSettings.tagline || "", 14, startY);
    doc.text(`Address: ${shopSettings.address || "Local Market"}`, 14, startY + 6);
    doc.text(`Phone: ${shopSettings.phone || ""} | GSTIN: ${shopSettings.gstin || ""}`, 14, startY + 12);
    doc.text(`Bill Number: ${bill.billNumber}`, 14, startY + 22);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`, 14, startY + 28);
    doc.text(`Payment Mode: ${bill.paymentMethod}`, 14, startY + 34);
    if (bill.customer) {
      doc.text(`Customer: ${bill.customer.name} (${bill.customer.phone})`, 14, startY + 40);
    }

    let y = startY + 50;
    doc.setFont("helvetica", "bold");
    doc.text("#", 14, y);
    doc.text("Item Name", 25, y);
    doc.text("Qty", 110, y);
    doc.text("Price", 135, y);
    doc.text("Total", 170, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    doc.setFont("helvetica", "normal");
    bill.items.forEach((item: any, index: number) => {
      doc.text(String(index + 1), 14, y);
      doc.text(item.product?.name || "Product", 25, y);
      doc.text(String(item.quantity), 110, y);
      doc.text(`Rs. ${Number(item.price).toFixed(2)}`, 135, y);
      doc.text(`Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`, 170, y);
      y += 8;
    });

    doc.line(14, y, 196, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${Number(bill.totalAmount).toFixed(2)}`, 130, y);
    y += 16;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(shopSettings.receiptFooter || "Thank you for shopping with us!", 14, y);
    doc.save(`${bill.billNumber}.pdf`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setShopSettings({ ...shopSettings, logoUrl: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if ((paymentMethod === "UPI" || paymentMethod === "CARD") && !transactionRef.trim()) {
      alert(`Transaction ID / Reference No. is mandatory for ${paymentMethod} payments.`);
      return;
    }
    if (paymentMethod === "CREDIT" && !selectedCustomerId) {
      alert("Please select a registered customer for Credit (Udhar) sales.");
      return;
    }

    try {
      const res = await checkoutCart(
        cart.map(item => ({ productId: item.product.id, quantity: item.quantity })), 
        paymentMethod, 
        selectedCustomerId === "" ? undefined : Number(selectedCustomerId),
        transactionRef,
        walkinName,
        walkinPhone
      );
      alert("Checkout successful! Generating invoice PDF...");
      generatePDFInvoice(res.bill);
      setCart([]);
      setSelectedCustomerId("");
      setTransactionRef("");
      setWalkinName("");
      setWalkinPhone("");
      loadData();
    } catch (err: any) { alert("Checkout error: " + (err.response?.data?.error || err.message)); }
  };

  const menuItems = [
    { label: "POS Billing", icon: <POSIcon /> },
    { label: "Inventory", icon: <InventoryIcon /> },
    { label: "Sales History", icon: <HistoryIcon /> },
    { label: "Customers & Udhar", icon: <CustomersIcon /> },
    { label: "Suppliers & Payables", icon: <SupplierIcon /> },
    { label: "Staff & Payroll", icon: <StaffIcon /> },
    { label: "Expenses & Loans", icon: <FinanceIcon /> },
    { label: "MIS Analytics & BI", icon: <MISIcon /> },
    { label: "General Ledger & P&L", icon: <LedgerIcon /> },
    { label: "Reports & GSTR-1", icon: <ReportIcon /> },
    { label: "Shop Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`, 
          bgcolor: "#ffffff", 
          color: "#333", 
          boxShadow: "0px 1px 4px rgba(34, 33, 33, 0.1)" 
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {shopSettings.shopName} Enterprise ERP
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "#666" }}>Active Business:</Typography>
              <TextField select size="small" value={activeBusinessId} onChange={handleBusinessChange} sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 1 }}>
                {businesses.map((b) => (<MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>))}
                <MenuItem value="ADD_NEW" sx={{ color: "primary.main", fontWeight: "bold" }}>+ Add New Business</MenuItem>
              </TextField>
            </Box>
            <Button variant="outlined" color="error" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Permanent Sidebar Drawer */}
      <Drawer 
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0, 
          "& .MuiDrawer-paper": { 
            width: drawerWidth, 
            boxSizing: "border-box", 
            bgcolor: "#142752", 
            color: "#fff", 
            borderRight: "none", 
            overflowX: "hidden" 
          } 
        }} 
        variant="permanent" 
        anchor="left"
      >
        <Toolbar sx={{ px: 3, py: 2 }}><Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#90caf9", letterSpacing: 0.5 }}>{shopSettings.shopName}</Typography></Toolbar>
        <List sx={{ mt: 1, px: 1.5 }}>
          {menuItems.map((item, index) => (
            <ListItem button key={item.label} selected={currentTab === index} onClick={() => setCurrentTab(index)} sx={{ "&.Mui-selected": { bgcolor: "#1976d2", color: "#fff", "&:hover": { bgcolor: "#1565c0" } }, "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" }, cursor: "pointer", mb: 0.8, borderRadius: 1.5, py: 1.2 }}>
              <ListItemIcon sx={{ color: currentTab === index ? "#fff" : "#b0bec5", minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: currentTab === index ? "600" : "400" }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content Area Rendering Modular Components */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, pb: 6, boxSizing: "border-box" }}>
        {currentTab === 0 && (
          <POSBillingTab 
            products={products} posSearch={posSearch} setPosSearch={setPosSearch} 
            cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} 
            updateCartQty={updateCartQty} cartTotal={cartTotal} paymentMethod={paymentMethod} 
            setPaymentMethod={setPaymentMethod} walkinName={walkinName} setWalkinName={setWalkinName} 
            walkinPhone={walkinPhone} setWalkinPhone={setWalkinPhone} transactionRef={transactionRef} 
            setTransactionRef={setTransactionRef} selectedCustomerId={selectedCustomerId} 
            setSelectedCustomerId={setSelectedCustomerId} customers={customers} handleCheckout={handleCheckout} 
          />
        )}

        {currentTab === 1 && (
          <InventoryTab 
            products={products} categories={categories} search={search} setSearch={setSearch} 
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} 
            setOpenProductDialog={setOpenProductDialog} setOpenCategoryDialog={setOpenCategoryDialog} 
            setSelectedProduct={setSelectedProduct} setOpenStockDialog={setOpenStockDialog} reportData={reportData} 
          />
        )}

        {currentTab === 2 && (
          <SalesHistoryTab bills={bills} generatePDFInvoice={generatePDFInvoice} />
        )}

        {currentTab === 3 && (
          <CustomersTab 
            customers={customers} setOpenCustomerDialog={setOpenCustomerDialog} 
            setSelectedCustomer={setSelectedCustomer} setOpenPaymentDialog={setOpenPaymentDialog} 
          />
        )}

        {currentTab === 4 && (
          <SuppliersTab 
            suppliers={suppliers} setOpenSupplierDialog={setOpenSupplierDialog} 
            setOpenPurchaseDialog={setOpenPurchaseDialog} setSelectedSupplier={setSelectedSupplier} 
            setOpenSupplierPayDialog={setOpenSupplierPayDialog} 
          />
        )}

        {currentTab === 5 && (
          <StaffPayrollTab 
            staffList={staffList} setOpenStaffDialog={setOpenStaffDialog} 
            loadData={loadData} 
          />
        )}

        {currentTab === 6 && (
          <ExpensesTab 
            expenses={expenses} liabilities={liabilities} setOpenExpenseDialog={setOpenExpenseDialog} 
            setOpenLoanDialog={setOpenLoanDialog} setSelectedLoan={setSelectedLoan} setOpenEmiDialog={setOpenEmiDialog} 
          />
        )}

        {currentTab === 7 && (
          <MISTab reportData={reportData} />
        )}

        {currentTab === 8 && (
          <LedgerTab financials={financials} />
        )}

        {currentTab === 9 && (
          <ReportsTab reportData={reportData} taxReport={taxReport} />
        )}

        {currentTab === 10 && (
          <SettingsTab 
            shopSettings={shopSettings} 
            setShopSettings={setShopSettings} 
            handleLogoUpload={handleLogoUpload} 
            handleSaveSettings={handleSaveSettings}
            businesses={businesses}
            activeBusinessId={activeBusinessId}
            handleBusinessChange={handleBusinessChange}
            loadData={loadData} 
          />
        )}
      </Box>

      {/* Register Business Dialog */}
      <Dialog open={openBusinessDialog} onClose={() => setOpenBusinessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Business</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Business Name" fullWidth value={newBusinessData.name} onChange={(e) => setNewBusinessData({...newBusinessData, name: e.target.value})} />
          <TextField label="Phone Number" fullWidth value={newBusinessData.phone} onChange={(e) => setNewBusinessData({...newBusinessData, phone: e.target.value})} />
          <TextField label="Business Address" fullWidth multiline rows={2} value={newBusinessData.address} onChange={(e) => setNewBusinessData({...newBusinessData, address: e.target.value})} />
          <TextField label="GSTIN / Tax ID" fullWidth value={newBusinessData.gstin} onChange={(e) => setNewBusinessData({...newBusinessData, gstin: e.target.value})} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenBusinessDialog(false)}>Cancel</Button><Button variant="contained" onClick={handleSaveNewBusiness}>Create Business</Button></DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Category Name *" fullWidth value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCategory}>Save Category</Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product to Inventory</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Product Name *" fullWidth value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Category *" fullWidth value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}>
                <MenuItem value="">-- Select Category --</MenuItem>
                {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Cost Price (Rs.) *" fullWidth type="number" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Selling Price (Rs.) *" fullWidth type="number" value={newProduct.sellingPrice} onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select label="GST Rate" fullWidth value={newProduct.gstRate} onChange={(e) => setNewProduct({...newProduct, gstRate: e.target.value})}>
                <MenuItem value="0">0%</MenuItem>
                <MenuItem value="5">5%</MenuItem>
                <MenuItem value="12">12%</MenuItem>
                <MenuItem value="18">18%</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Opening Stock Qty" fullWidth type="number" value={newProduct.openingStock} onChange={(e) => setNewProduct({...newProduct, openingStock: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Unit (pcs / kg / g)" fullWidth value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Barcode / SKU" fullWidth value={newProduct.barcode} onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct}>Save Product</Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock: {selectedProduct?.name}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField select label="Adjustment Type" fullWidth value={stockAdjustment.type} onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}>
            <MenuItem value="ADD">Add Stock (Restock)</MenuItem>
            <MenuItem value="SUBTRACT">Reduce Stock (Damage / Loss)</MenuItem>
          </TextField>
          <TextField label="Quantity *" fullWidth type="number" value={stockAdjustment.quantity} onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})} />
          <TextField label="Notes / Reason" fullWidth multiline rows={2} value={stockAdjustment.notes} onChange={(e) => setStockAdjustment({...stockAdjustment, notes: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStockAdjustment}>Confirm Adjustment</Button>
        </DialogActions>
      </Dialog>

      {/* Register Customer Dialog */}
      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Customer</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField 
            label="Customer Name *" 
            fullWidth 
            value={newCustomer.name} 
            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} 
          />
          <TextField 
            label="Phone Number *" 
            fullWidth 
            value={newCustomer.phone} 
            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} 
          />
          <TextField 
            label="Address" 
            fullWidth 
            multiline 
            rows={2} 
            value={newCustomer.address} 
            onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} 
          />
          <TextField 
            label="Credit Limit (Rs.)" 
            fullWidth 
            type="number" 
            value={newCustomer.creditLimit} 
            onChange={(e) => setNewCustomer({...newCustomer, creditLimit: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newCustomer.name || !newCustomer.phone) {
              alert("Customer name and phone number are mandatory.");
              return;
            }
            try {
              await api.post("/customers", newCustomer);
              setOpenCustomerDialog(false);
              setNewCustomer({ name: "", phone: "", address: "", creditLimit: "10000" });
              loadData();
              alert("Customer registered successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to register customer");
            }
          }}>Save Customer</Button>
        </DialogActions>
      </Dialog>

      {/* Register Supplier Dialog */}
      <Dialog open={openSupplierDialog} onClose={() => setOpenSupplierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Supplier</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField 
            label="Supplier Name *" 
            fullWidth 
            value={newSupplier.name} 
            onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} 
          />
          <TextField 
            label="Company Name" 
            fullWidth 
            value={newSupplier.companyName} 
            onChange={(e) => setNewSupplier({...newSupplier, companyName: e.target.value})} 
          />
          <TextField 
            label="Phone Number *" 
            fullWidth 
            value={newSupplier.phone} 
            onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSupplierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newSupplier.name || !newSupplier.phone) {
              alert("Supplier name and phone are required.");
              return;
            }
            try {
              await api.post("/suppliers", newSupplier);
              setOpenSupplierDialog(false);
              setNewSupplier({ name: "", phone: "", companyName: "" });
              loadData();
              alert("Supplier registered successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to register supplier");
            }
          }}>Save Supplier</Button>
        </DialogActions>
      </Dialog>

      {/* Record Purchase Invoice Dialog */}
      <Dialog open={openPurchaseDialog} onClose={() => setOpenPurchaseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record Purchase Invoice & Update Stock</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Select Supplier *" fullWidth value={newPurchase.supplierId} onChange={(e) => setNewPurchase({...newPurchase, supplierId: e.target.value})}>
                <MenuItem value="">-- Choose Supplier --</MenuItem>
                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.companyName || "N/A"})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Invoice Number *" fullWidth value={newPurchase.invoiceNumber} onChange={(e) => setNewPurchase({...newPurchase, invoiceNumber: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Payment Type" fullWidth value={newPurchase.paymentType} onChange={(e) => setNewPurchase({...newPurchase, paymentType: e.target.value})}>
                <MenuItem value="CREDIT">Credit (Payable Due)</MenuItem>
                <MenuItem value="CASH">Paid Immediately (Cash)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Select Product *" fullWidth value={newPurchase.productId} onChange={(e) => setNewPurchase({...newPurchase, productId: e.target.value})}>
                <MenuItem value="">-- Choose Product --</MenuItem>
                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Quantity Purchased *" fullWidth type="number" value={newPurchase.quantity} onChange={(e) => setNewPurchase({...newPurchase, quantity: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Purchase Cost Price (Rs.) *" fullWidth type="number" value={newPurchase.costPrice} onChange={(e) => setNewPurchase({...newPurchase, costPrice: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurchaseDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newPurchase.supplierId || !newPurchase.productId || !newPurchase.quantity || !newPurchase.costPrice) {
              alert("Please fill in all mandatory purchase fields.");
              return;
            }
            try {
              await api.post("/suppliers/purchase", {
                supplierId: Number(newPurchase.supplierId),
                invoiceNumber: newPurchase.invoiceNumber || "INV-" + Date.now(),
                paymentType: newPurchase.paymentType,
                items: [{
                  productId: Number(newPurchase.productId),
                  quantity: Number(newPurchase.quantity),
                  costPrice: Number(newPurchase.costPrice)
                }]
              });
              setOpenPurchaseDialog(false);
              setNewPurchase({ supplierId: "", invoiceNumber: "", paymentType: "CREDIT", productId: "", quantity: "", costPrice: "" });
              loadData();
              alert("Purchase invoice recorded & inventory updated successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to record purchase invoice");
            }
          }}>Save Purchase Invoice</Button>
        </DialogActions>
      </Dialog>

      {/* Register Staff Dialog */}
      <Dialog open={openStaffDialog} onClose={() => setOpenStaffDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Staff Member</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField 
            label="Staff Name *" 
            fullWidth 
            value={newStaff.name} 
            onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} 
          />
          <TextField 
            label="Phone Number *" 
            fullWidth 
            value={newStaff.phone} 
            onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})} 
          />
          <TextField select label="Role" fullWidth value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}>
            <MenuItem value="CASHIER">Cashier</MenuItem>
            <MenuItem value="STORE_MANAGER">Store Manager</MenuItem>
            <MenuItem value="DELIVERY">Delivery Boy</MenuItem>
            <MenuItem value="HELPER">Helper</MenuItem>
          </TextField>
          <TextField 
            label="Monthly Salary (Rs.) *" 
            fullWidth 
            type="number" 
            value={newStaff.monthlySalary} 
            onChange={(e) => setNewStaff({...newStaff, monthlySalary: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStaffDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newStaff.name || !newStaff.phone || !newStaff.monthlySalary) {
              alert("Please fill in all mandatory staff fields.");
              return;
            }
            try {
              await api.post("/staff", {
                ...newStaff,
                monthlySalary: Number(newStaff.monthlySalary)
              });
              setOpenStaffDialog(false);
              setNewStaff({ name: "", phone: "", role: "CASHIER", monthlySalary: "" });
              loadData();
              alert("Staff registered successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to register staff");
            }
          }}>Save Staff</Button>
        </DialogActions>
      </Dialog>

      {/* Mark Attendance Dialog */}
      <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Daily Staff Attendance</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField select label="Select Staff Member *" fullWidth value={newAttendance.staffId} onChange={(e) => setNewAttendance({...newAttendance, staffId: e.target.value})}>
            <MenuItem value="">-- Choose Staff --</MenuItem>
            {staffList.map(st => <MenuItem key={st.id} value={st.id}>{st.name} ({st.role})</MenuItem>)}
          </TextField>
          <TextField select label="Attendance Status *" fullWidth value={newAttendance.status} onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}>
            <MenuItem value="PRESENT">Present</MenuItem>
            <MenuItem value="ABSENT">Absent</MenuItem>
            <MenuItem value="HALF_DAY">Half Day</MenuItem>
          </TextField>
          <TextField 
            label="Overtime Hours" 
            fullWidth 
            type="number" 
            value={newAttendance.overtimeHrs} 
            onChange={(e) => setNewAttendance({...newAttendance, overtimeHrs: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newAttendance.staffId) {
              alert("Please select a staff member.");
              return;
            }
            try {
              await api.post("/staff/attendance", {
                staffId: Number(newAttendance.staffId),
                status: newAttendance.status,
                overtimeHrs: Number(newAttendance.overtimeHrs)
              });
              setOpenAttendanceDialog(false);
              setNewAttendance({ staffId: "", status: "PRESENT", overtimeHrs: "0" });
              loadData();
              alert("Attendance marked successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to mark attendance");
            }
          }}>Save Attendance</Button>
        </DialogActions>
      </Dialog>

      {/* Disburse Salary Payroll Dialog */}
      <Dialog open={openPayrollDialog} onClose={() => setOpenPayrollDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Disburse Monthly Salary Payroll</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField select label="Select Staff Member *" fullWidth value={newPayroll.staffId} onChange={(e) => {
            const selectedSt = staffList.find(s => s.id === Number(e.target.value));
            setNewPayroll({
              ...newPayroll, 
              staffId: e.target.value,
              baseSalary: selectedSt ? String(selectedSt.monthlySalary) : ""
            });
          }}>
            <MenuItem value="">-- Choose Staff --</MenuItem>
            {staffList.map(st => (
              <MenuItem key={st.id} value={st.id}>
                {st.name} (Rs. {st.monthlySalary})
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Payroll Month (YYYY-MM) *" 
            fullWidth 
            value={newPayroll.month} 
            onChange={(e) => setNewPayroll({...newPayroll, month: e.target.value})} 
          />
          <TextField 
            label="Base Salary Disbursed (Rs.) *" 
            fullWidth 
            type="number" 
            value={newPayroll.baseSalary} 
            onChange={(e) => setNewPayroll({...newPayroll, baseSalary: e.target.value})} 
          />
          <TextField 
            label="Deductions / Advances (Rs.)" 
            fullWidth 
            type="number" 
            value={newPayroll.deductions} 
            onChange={(e) => setNewPayroll({...newPayroll, deductions: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayrollDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={async () => {
            if (!newPayroll.staffId || !newPayroll.baseSalary) {
              alert("Please select staff and enter salary amount.");
              return;
            }
            try {
              await api.post("/staff/payroll", {
                staffId: Number(newPayroll.staffId),
                month: newPayroll.month,
                baseSalary: Number(newPayroll.baseSalary),
                deductions: Number(newPayroll.deductions)
              });
              setOpenPayrollDialog(false);
              setNewPayroll({ staffId: "", month: "2026-11", baseSalary: "", deductions: "0" });
              loadData();
              alert("Salary disbursed successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to process payroll");
            }
          }}>Disburse Salary</Button>
        </DialogActions>
      </Dialog>

      {/* Record Expense Dialog */}
      <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Operating Expense</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField select label="Expense Category *" fullWidth value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}>
            <MenuItem value="RENT">Rent</MenuItem>
            <MenuItem value="UTILITIES">Utilities (Electricity/Water)</MenuItem>
            <MenuItem value="MAINTENANCE">Maintenance & Repairs</MenuItem>
            <MenuItem value="SALARY_ADVANCE">Salary Advance / Misc</MenuItem>
            <MenuItem value="TRANSPORT">Transport & Logistics</MenuItem>
          </TextField>
          <TextField 
            label="Amount (Rs.) *" 
            fullWidth 
            type="number" 
            value={newExpense.amount} 
            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} 
          />
          <TextField 
            label="Paid To / Vendor Name" 
            fullWidth 
            value={newExpense.paidTo} 
            onChange={(e) => setNewExpense({...newExpense, paidTo: e.target.value})} 
          />
          <TextField 
            label="Notes / Description" 
            fullWidth 
            multiline 
            rows={2} 
            value={newExpense.notes} 
            onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!newExpense.amount || !newExpense.category) {
              alert("Please fill in expense category and amount.");
              return;
            }
            try {
              await api.post("/finances/expenses", {
                ...newExpense,
                amount: Number(newExpense.amount)
              });
              setOpenExpenseDialog(false);
              setNewExpense({ category: "RENT", amount: "", paidTo: "", notes: "" });
              loadData();
              alert("Expense recorded successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to save expense");
            }
          }}>Save Expense</Button>
        </DialogActions>
      </Dialog>

      {/* Add Loan / Liability Dialog */}
      <Dialog open={openLoanDialog} onClose={() => setOpenLoanDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Business Loan / Liability</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField 
            label="Lender Name / Bank *" 
            fullWidth 
            value={newLoan.lenderName} 
            onChange={(e) => setNewLoan({...newLoan, lenderName: e.target.value})} 
          />
          <TextField 
            label="Total Loan Amount (Rs.) *" 
            fullWidth 
            type="number" 
            value={newLoan.totalAmount} 
            onChange={(e) => setNewLoan({...newLoan, totalAmount: e.target.value})} 
          />
          <TextField 
            label="Interest Rate (% p.a.)" 
            fullWidth 
            type="number" 
            value={newLoan.interestRate} 
            onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})} 
          />
          <TextField 
            label="Monthly EMI Amount (Rs.) *" 
            fullWidth 
            type="number" 
            value={newLoan.monthlyEMI} 
            onChange={(e) => setNewLoan({...newLoan, monthlyEMI: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoanDialog(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={async () => {
            if (!newLoan.lenderName || !newLoan.totalAmount || !newLoan.monthlyEMI) {
              alert("Please fill in lender name, total amount, and monthly EMI.");
              return;
            }
            try {
              await api.post("/finances/liabilities", {
                lenderName: newLoan.lenderName,
                totalAmount: Number(newLoan.totalAmount),
                interestRate: Number(newLoan.interestRate || 0),
                monthlyEMI: Number(newLoan.monthlyEMI)
              });
              setOpenLoanDialog(false);
              setNewLoan({ lenderName: "", totalAmount: "", interestRate: "", monthlyEMI: "" });
              loadData();
              alert("Loan liability added successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to save loan liability");
            }
          }}>Save Loan</Button>
        </DialogActions>
      </Dialog>

      {/* Pay Loan EMI Dialog */}
      <Dialog open={openEmiDialog} onClose={() => setOpenEmiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pay EMI for: {selectedLoan?.lenderName}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Outstanding Balance: Rs. {Number(selectedLoan?.outstanding || 0).toFixed(2)}
          </Typography>
          <TextField 
            label="EMI Amount to Pay (Rs.) *" 
            fullWidth 
            type="number" 
            value={emiAmount} 
            onChange={(e) => setEmiAmount(e.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmiDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={async () => {
            if (!selectedLoan || !emiAmount) {
              alert("Please enter the EMI payment amount.");
              return;
            }
            try {
              await api.post(`/finances/liabilities/${selectedLoan.id}/pay-emi`, {
                amount: Number(emiAmount)
              });
              setOpenEmiDialog(false);
              setEmiAmount("");
              setSelectedLoan(null);
              loadData();
              alert("EMI payment recorded successfully!");
            } catch (err: any) {
              alert(err.response?.data?.error || "Failed to record EMI payment");
            }
          }}>Record EMI Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}