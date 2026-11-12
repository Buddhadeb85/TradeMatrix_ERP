import React from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip, Grid } from '@mui/material';
import { Add as AddIcon, Warning as WarningIcon } from '@mui/icons-material';

export const InventoryTab = ({ products, categories, search, setSearch, selectedCategory, setSelectedCategory, setOpenProductDialog, setOpenCategoryDialog, setSelectedProduct, setOpenStockDialog, reportData }: any) => {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="textSecondary">Total Products</Typography><Typography variant="h4">{products.length}</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", bgcolor: reportData.lowStockCount > 0 ? "#ffebee" : "inherit", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="error">Low Stock Alerts</Typography><Typography variant="h4" color="error">{reportData.lowStockCount}</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="textSecondary">Inventory Cost Value</Typography><Typography variant="h4">Rs. {reportData.inventoryCostValue.toFixed(2)}</Typography></Paper></Grid>
      </Grid>
      <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexGrow: 1 }}>
            <TextField label="Search Products" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 300 }} />
            <TextField select label="Filter Category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : Number(e.target.value))} size="small" sx={{ minWidth: 180 }}>
              <MenuItem value="">All Categories</MenuItem>{categories.map((cat: any) => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
            </TextField>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}><Button variant="outlined" onClick={() => setOpenCategoryDialog(true)}>Add Category</Button><Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenProductDialog(true)}>Add Product</Button></Box>
        </Box>
      </Paper>
      <TableContainer component={Paper} sx={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>Product Name</b></TableCell><TableCell><b>Category</b></TableCell><TableCell><b>GST Rate</b></TableCell><TableCell align="right"><b>Cost (Rs.)</b></TableCell><TableCell align="right"><b>Selling Price (Rs.)</b></TableCell><TableCell align="center"><b>Stock</b></TableCell><TableCell align="center"><b>Status</b></TableCell><TableCell align="center"><b>Actions</b></TableCell></TableRow></TableHead>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell><TableCell>{product.category?.name}</TableCell><TableCell><Chip label={`${product.gstRate || 5}% GST`} size="small" color="info" /></TableCell>
                <TableCell align="right">Rs. {Number(product.costPrice).toFixed(2)}</TableCell><TableCell align="right">Rs. {Number(product.sellingPrice).toFixed(2)}</TableCell>
                <TableCell align="center">{product.currentStock} {product.unit}</TableCell>
                <TableCell align="center">{product.isLowStock ? <Chip icon={<WarningIcon />} label="Low Stock" color="error" size="small" /> : <Chip label="Normal" color="success" size="small" />}</TableCell>
                <TableCell align="center"><Button size="small" variant="outlined" onClick={() => { setSelectedProduct(product); setOpenStockDialog(true); }}>Adjust Stock</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
    </Box>
  );
};
