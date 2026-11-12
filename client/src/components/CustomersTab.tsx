import React from 'react';
import { Box, Paper, Typography, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const CustomersTab = ({ customers, setOpenCustomerDialog, setSelectedCustomer, setOpenPaymentDialog }: any) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6">Customer Credit (Udhar) & Accounts Receivable</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCustomerDialog(true)}>Register Customer</Button>
      </Paper>
      <TableContainer component={Paper} sx={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow><TableCell><b>Customer Name</b></TableCell><TableCell><b>Phone</b></TableCell><TableCell><b>Address</b></TableCell><TableCell align="right"><b>Credit Limit (Rs.)</b></TableCell><TableCell align="right"><b>Current Due (Rs.)</b></TableCell><TableCell align="center"><b>Action</b></TableCell></TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? <TableRow><TableCell colSpan={6} align="center">No customers registered yet.</TableCell></TableRow> : customers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell><TableCell>{c.phone}</TableCell><TableCell>{c.address || "-"}</TableCell>
                <TableCell align="right">Rs. {Number(c.creditLimit).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ color: Number(c.currentDue) > 0 ? "error.main" : "text.primary", fontWeight: "bold" }}>Rs. {Number(c.currentDue).toFixed(2)}</TableCell>
                <TableCell align="center"><Button size="small" variant="contained" color="success" onClick={() => { setSelectedCustomer(c); setOpenPaymentDialog(true); }}>Settle Due</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
