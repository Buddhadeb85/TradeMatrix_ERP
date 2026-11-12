import React from 'react';
import { Box, Paper, Typography, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const SuppliersTab = ({ suppliers, setOpenSupplierDialog, setOpenPurchaseDialog, setSelectedSupplier, setOpenSupplierPayDialog }: any) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6">Wholesale Suppliers & Merchant Credit (Accounts Payable)</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenSupplierDialog(true)}>Register Supplier</Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenPurchaseDialog(true)}>Record Purchase Invoice</Button>
        </Box>
      </Paper>
      <TableContainer component={Paper} sx={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow><TableCell><b>Supplier / Merchant Name</b></TableCell><TableCell><b>Company</b></TableCell><TableCell><b>Phone</b></TableCell><TableCell align="right"><b>Outstanding Payable (Rs.)</b></TableCell><TableCell align="center"><b>Action</b></TableCell></TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? <TableRow><TableCell colSpan={5} align="center">No suppliers registered yet.</TableCell></TableRow> : suppliers.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell><TableCell>{s.companyName || "-"}</TableCell><TableCell>{s.phone}</TableCell>
                <TableCell align="right" sx={{ color: Number(s.currentDue) > 0 ? "error.main" : "text.primary", fontWeight: "bold" }}>Rs. {Number(s.currentDue).toFixed(2)}</TableCell>
                <TableCell align="center"><Button size="small" variant="contained" color="success" onClick={() => { setSelectedSupplier(s); setOpenSupplierPayDialog(true); }}>Pay Bill / Settle</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
