import React from 'react';
import { Box, Paper, Typography, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const ExpensesTab = ({ expenses, liabilities, setOpenExpenseDialog, setOpenLoanDialog, setSelectedLoan, setOpenEmiDialog }: any) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Operating Expenses (Rent, Utilities, Maintenance)</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenExpenseDialog(true)}>Record Expense</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>Date</b></TableCell><TableCell><b>Category</b></TableCell><TableCell><b>Paid To</b></TableCell><TableCell><b>Notes</b></TableCell><TableCell align="right"><b>Amount (Rs.)</b></TableCell></TableRow></TableHead>
            <TableBody>
              {expenses.length === 0 ? <TableRow><TableCell colSpan={5} align="center">No expenses recorded yet.</TableCell></TableRow> : expenses.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell><TableCell><Chip label={e.category} size="small" color="primary" /></TableCell><TableCell>{e.paidTo}</TableCell><TableCell>{e.notes || "-"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>Rs. {Number(e.amount).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Business Liabilities & Bank Loans</Typography>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenLoanDialog(true)}>Add Loan / Liability</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>Lender Name</b></TableCell><TableCell align="right"><b>Total Loan (Rs.)</b></TableCell><TableCell align="right"><b>Outstanding (Rs.)</b></TableCell><TableCell align="right"><b>Monthly EMI (Rs.)</b></TableCell><TableCell align="center"><b>Status</b></TableCell><TableCell align="center"><b>Action</b></TableCell></TableRow></TableHead>
            <TableBody>
              {liabilities.length === 0 ? <TableRow><TableCell colSpan={6} align="center">No active loans or liabilities recorded.</TableCell></TableRow> : liabilities.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell>{l.lenderName}</TableCell><TableCell align="right">Rs. {Number(l.totalAmount).toFixed(2)}</TableCell><TableCell align="right" sx={{ color: "error.main", fontWeight: "bold" }}>Rs. {Number(l.outstanding).toFixed(2)}</TableCell><TableCell align="right">Rs. {Number(l.monthlyEMI).toFixed(2)}</TableCell>
                  <TableCell align="center"><Chip label={l.status} size="small" color={l.status === "ACTIVE" ? "error" : "success"} /></TableCell>
                  <TableCell align="center">{l.status === "ACTIVE" && (<Button size="small" variant="outlined" color="success" onClick={() => { setSelectedLoan(l); setOpenEmiDialog(true); }}>Pay EMI</Button>)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
