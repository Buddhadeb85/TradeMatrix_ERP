import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Table, TableContainer, TableHead, 
  TableRow, TableCell, TableBody, TextField, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogActions, Button, Chip 
} from '@mui/material';

export const MISTab = ({ reportData }: any) => {
  const [selectedReportFilter, setSelectedReportFilter] = useState('');
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const handleReportSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      setSelectedReportFilter(value);
      setOpenReportDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenReportDialog(false);
    setSelectedReportFilter('');
  };

  const renderDialogContent = () => {
    switch (selectedReportFilter) {
      case 'Payment Mode Wise Sales':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Payment Mode</b></TableCell><TableCell align="right"><b>Total Sales (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.paymentTotals || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data recorded.</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.paymentTotals).map(([method, amount]: any) => (
                    <TableRow key={method}><TableCell>{method}</TableCell><TableCell align="right">Rs. {Number(amount || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Product-wise Sales Performance':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Product Name</b></TableCell><TableCell align="center"><b>Qty Sold</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {!reportData.productWiseSales || reportData.productWiseSales.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No sales recorded yet.</TableCell></TableRow>
                ) : (
                  reportData.productWiseSales.map((p: any) => (
                    <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell align="center">{p.qty}</TableCell><TableCell align="right">Rs. {Number(p.revenue || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Customer-wise Sales Breakdown':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Customer Name</b></TableCell><TableCell align="right"><b>Total Sales (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.customerWiseSales || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.customerWiseSales).map(([cust, rev]: any) => (
                    <TableRow key={cust}><TableCell>{cust}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Supplier & Merchant-wise Payables':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Supplier Name</b></TableCell><TableCell align="right"><b>Outstanding Due (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.supplierWise || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.supplierWise).map(([sup, due]: any) => (
                    <TableRow key={sup}><TableCell>{sup}</TableCell><TableCell align="right">Rs. {Number(due || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Category-wise Sales Breakdown':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Category Name</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.categoryWiseSales || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.categoryWiseSales).map(([cat, rev]: any) => (
                    <TableRow key={cat}><TableCell>{cat}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Expense-wise Breakdown':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Expense Category</b></TableCell><TableCell align="right"><b>Amount (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.expenseWise || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.expenseWise).map(([cat, amt]: any) => (
                    <TableRow key={cat}><TableCell>{cat}</TableCell><TableCell align="right">Rs. {Number(amt || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Date-wise Sales Trend':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Date</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.dayWiseSales || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.dayWiseSales).map(([date, rev]: any) => (
                    <TableRow key={date}><TableCell>{date}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Month-wise Sales Trend':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Month (YYYY-MM)</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.monthWiseSales || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.monthWiseSales).map(([month, rev]: any) => (
                    <TableRow key={month}><TableCell>{month}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Staff-wise Attendance & Payroll':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow><TableCell><b>Staff Name</b></TableCell><TableCell align="center"><b>Days Present</b></TableCell><TableCell align="right"><b>Payroll Paid (Rs.)</b></TableCell></TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(reportData.staffWise || {}).length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">No data</TableCell></TableRow>
                ) : (
                  Object.entries(reportData.staffWise).map(([stName, data]: any) => (
                    <TableRow key={stName}><TableCell>{stName}</TableCell><TableCell align="center">{data.attendanceCount}</TableCell><TableCell align="right">Rs. {Number(data.payrollPaid || 0).toFixed(2)}</TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Inventory-wise Cost & Valuation':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell><b>Product Name</b></TableCell>
                  <TableCell align="center"><b>Available Stock</b></TableCell>
                  <TableCell align="right"><b>Cost Price (Rs.)</b></TableCell>
                  <TableCell align="right"><b>Total Valuation (Rs.)</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!reportData.inventoryWiseCost || reportData.inventoryWiseCost.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">No inventory items found.</TableCell></TableRow>
                ) : (
                  reportData.inventoryWiseCost.map((item: any) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.stock}</TableCell>
                      <TableCell align="right">Rs. {Number(item.costPrice || 0).toFixed(2)}</TableCell>
                      <TableCell align="right"><b>Rs. {Number(item.totalValuation || 0).toFixed(2)}</b></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'Low Stock Inventory Alert':
        return (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#fff1f2" }}>
                <TableRow>
                  <TableCell><b>Product Name</b></TableCell>
                  <TableCell align="center"><b>Current Stock</b></TableCell>
                  <TableCell align="center"><b>Threshold</b></TableCell>
                  <TableCell align="center"><b>Alert Status</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!reportData.inventoryWiseCost || reportData.inventoryWiseCost.filter((i: any) => i.isLowStock).length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">All inventory stock levels are optimal!</TableCell></TableRow>
                ) : (
                  reportData.inventoryWiseCost.filter((i: any) => i.isLowStock).map((item: any) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.stock}</TableCell>
                      <TableCell align="center">{item.lowStockLevel}</TableCell>
                      <TableCell align="center"><Chip label="LOW STOCK" color="error" size="small" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return <Typography>No report selected.</Typography>;
    }
  };

  return (
    <Box>
      {/* Top Header Row with Filter Dropdown on the Right */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Management Information System (MIS) - Advanced Business Intelligence
        </Typography>

        <TextField
          select
          size="small"
          label="Filter & View Specific Report"
          value={selectedReportFilter}
          onChange={handleReportSelectChange}
          sx={{ minWidth: 300, bgcolor: "#fff", borderRadius: 1 }}
        >
          <MenuItem value="">-- Select Report to Popup --</MenuItem>
          <MenuItem value="Payment Mode Wise Sales">Payment Mode Wise Sales</MenuItem>
          <MenuItem value="Product-wise Sales Performance">Product-wise Sales Performance</MenuItem>
          <MenuItem value="Customer-wise Sales Breakdown">Customer-wise Sales Breakdown</MenuItem>
          <MenuItem value="Supplier & Merchant-wise Payables">Supplier & Merchant-wise Payables</MenuItem>
          <MenuItem value="Category-wise Sales Breakdown">Category-wise Sales Breakdown</MenuItem>
          <MenuItem value="Expense-wise Breakdown">Expense-wise Breakdown</MenuItem>
          <MenuItem value="Date-wise Sales Trend">Date-wise Sales Trend</MenuItem>
          <MenuItem value="Month-wise Sales Trend">Month-wise Sales Trend</MenuItem>
          <MenuItem value="Staff-wise Attendance & Payroll">Staff-wise Attendance & Payroll</MenuItem>
          <MenuItem value="Inventory-wise Cost & Valuation">Inventory-wise Cost & Valuation</MenuItem>
          <MenuItem value="Low Stock Inventory Alert">Low Stock Inventory Alert</MenuItem>
        </TextField>
      </Box>
      
      {/* Executive KPI Summary Cards including Inventory Valuations */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e3f2fd", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle2" color="primary">Total Revenue</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">Rs. {Number(reportData.totalSalesRevenue || 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e8f5e9", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle2" color="success.main">Net Operating Profit</Typography>
            <Typography variant="h5" color="success.main" fontWeight="bold">Rs. {Number(reportData.netOperatingProfit || 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#ede9fe", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle2" color="secondary.main">Inventory Cost Value</Typography>
            <Typography variant="h5" color="secondary.main" fontWeight="bold">Rs. {Number(reportData.inventoryCostValue || 0).toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#fee2e2", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle2" color="error">Low Stock Alerts</Typography>
            <Typography variant="h5" color="error" fontWeight="bold">{reportData.lowStockCount || 0} Items</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Mode Wise Sales */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" gutterBottom>Payment Mode Wise Sales</Typography>
        <Grid container spacing={2}>
          {Object.keys(reportData.paymentTotals || {}).length === 0 ? (
            <Typography color="textSecondary" sx={{ p: 2 }}>No sales recorded.</Typography>
          ) : (
            Object.entries(reportData.paymentTotals).map(([method, amount]: any) => (
              <Grid item xs={12} sm={3} key={method}>
                <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Typography variant="subtitle2">{method}</Typography>
                  <Typography variant="h5">Rs. {Number(amount || 0).toFixed(2)}</Typography>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Granular Breakdown Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="primary">Product-wise Sales Performance</Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                  <TableRow><TableCell><b>Product Name</b></TableCell><TableCell align="center"><b>Qty Sold</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {!reportData.productWiseSales || reportData.productWiseSales.length === 0 ? (
                    <TableRow><TableCell colSpan={3} align="center">No sales recorded yet.</TableCell></TableRow>
                  ) : (
                    reportData.productWiseSales.map((p: any) => (
                      <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell align="center">{p.qty}</TableCell><TableCell align="right">Rs. {Number(p.revenue || 0).toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="primary">Customer-wise Sales Breakdown</Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                  <TableRow><TableCell><b>Customer Name</b></TableCell><TableCell align="right"><b>Total Sales (Rs.)</b></TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(reportData.customerWiseSales || {}).length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                  ) : (
                    Object.entries(reportData.customerWiseSales).map(([cust, rev]: any) => (
                      <TableRow key={cust}><TableCell>{cust}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="error.main">Supplier & Merchant-wise Payables</Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                  <TableRow><TableCell><b>Supplier Name</b></TableCell><TableCell align="right"><b>Outstanding Due (Rs.)</b></TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(reportData.supplierWise || {}).length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                  ) : (
                    Object.entries(reportData.supplierWise).map(([sup, due]: any) => (
                      <TableRow key={sup}><TableCell>{sup}</TableCell><TableCell align="right">Rs. {Number(due || 0).toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="success.main">Category-wise Sales Breakdown</Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                  <TableRow><TableCell><b>Category Name</b></TableCell><TableCell align="right"><b>Revenue (Rs.)</b></TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(reportData.categoryWiseSales || {}).length === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center">No data</TableCell></TableRow>
                  ) : (
                    Object.entries(reportData.categoryWiseSales).map(([cat, rev]: any) => (
                      <TableRow key={cat}><TableCell>{cat}</TableCell><TableCell align="right">Rs. {Number(rev || 0).toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Pop-up Dialog Modal for Filtered Reports */}
      <Dialog open={openReportDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Report View: {selectedReportFilter}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, minHeight: 250 }}>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={handleCloseDialog} variant="contained">Close Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};