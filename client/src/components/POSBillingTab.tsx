import React from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Grid } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export const POSBillingTab = ({ products, posSearch, setPosSearch, cart, addToCart, removeFromCart, updateCartQty, cartTotal, paymentMethod, setPaymentMethod, walkinName, setWalkinName, walkinPhone, setWalkinPhone, transactionRef, setTransactionRef, selectedCustomerId, setSelectedCustomerId, customers, handleCheckout }: any) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
          <TextField label="Search Product by Name / Barcode / SKU" variant="outlined" size="small" fullWidth value={posSearch} onChange={(e) => setPosSearch(e.target.value)} />
        </Paper>
        <Grid container spacing={2}>
          {products.filter((p: any) => p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.barcode?.includes(posSearch)).map((product: any) => (
            <Grid item xs={12} sm={4} key={product.id}>
              <Paper onClick={() => addToCart(product)} sx={{ p: 2, cursor: "pointer", "&:hover": { bgcolor: "#e3f2fd", borderColor: "#1976d2" }, border: "1px solid #e0e0e0", boxShadow: "none", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box><Typography variant="subtitle1" fontWeight="bold">{product.name}</Typography><Typography variant="body2" color="textSecondary">Stock: {product.currentStock} {product.unit}</Typography></Box>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Rs. {Number(product.sellingPrice).toFixed(2)}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
          <Typography variant="h6" gutterBottom>Current Bill / Cart</Typography>
          <TableContainer sx={{ maxHeight: 280, mb: 2 }}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell align="center"></TableCell></TableRow></TableHead>
              <TableBody>
                {cart.length === 0 ? <TableRow><TableCell colSpan={4} align="center">Cart is empty</TableCell></TableRow> : cart.map((item: any) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell align="center"><input type="number" value={item.quantity} onChange={(e) => updateCartQty(item.product.id, Number(e.target.value))} style={{ width: 50, textAlign: "center" }} /></TableCell>
                    <TableCell align="right">Rs. {(Number(item.product.sellingPrice) * item.quantity).toFixed(2)}</TableCell>
                    <TableCell align="center"><Button color="error" size="small" onClick={() => removeFromCart(item.product.id)}><DeleteIcon fontSize="small" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}><Typography variant="h5">Total:</Typography><Typography variant="h5" color="primary" fontWeight="bold">Rs. {cartTotal.toFixed(2)}</Typography></Box>
          <TextField select label="Payment Method" fullWidth size="small" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI / QR</MenuItem><MenuItem value="CARD">Card</MenuItem><MenuItem value="CREDIT">Credit (Udhar)</MenuItem>
          </TextField>
          {paymentMethod !== "CREDIT" && (
            <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Customer Name (Optional)" fullWidth size="small" value={walkinName} onChange={(e) => setWalkinName(e.target.value)} placeholder="Walk-in Customer" />
              <TextField label="Customer Mobile (Optional)" fullWidth size="small" value={walkinPhone} onChange={(e) => setWalkinPhone(e.target.value)} placeholder="Phone Number" />
              <TextField label={`Transaction ID / Ref No. ${paymentMethod === "UPI" || paymentMethod === "CARD" ? "*" : ""}`} fullWidth size="small" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder={paymentMethod === "CASH" ? "Optional Receipt No" : "Mandatory Txn ID"} />
            </Box>
          )}
          {paymentMethod === "CREDIT" && (
            <Box sx={{ mb: 2 }}>
              <TextField select label="Select Customer *" fullWidth size="small" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value === "" ? "" : Number(e.target.value))}>
                <MenuItem value="">-- Choose Customer --</MenuItem>
                {customers.map((c: any) => (<MenuItem key={c.id} value={c.id}>{c.name} ({c.phone}) - Due: Rs. {c.currentDue}</MenuItem>))}
              </TextField>
            </Box>
          )}
          <Button variant="contained" color="success" fullWidth size="large" disabled={cart.length === 0} onClick={handleCheckout}>Complete Sale & Download PDF Bill</Button>
        </Paper>
      </Grid>
    </Grid>
  );
};
