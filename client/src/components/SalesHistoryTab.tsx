import React from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Chip, Button } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

export const SalesHistoryTab = ({ bills, generatePDFInvoice }: any) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fa" }}>
          <TableRow><TableCell><b>Bill Number</b></TableCell><TableCell><b>Customer</b></TableCell><TableCell><b>Date & Time</b></TableCell><TableCell><b>Payment Mode</b></TableCell><TableCell align="right"><b>Total Amount (Rs.)</b></TableCell><TableCell><b>Items</b></TableCell><TableCell align="center"><b>Action</b></TableCell></TableRow>
        </TableHead>
        <TableBody>
          {bills.map((bill: any) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.billNumber}</TableCell><TableCell>{bill.customer ? bill.customer.name : "Walk-in Customer"}</TableCell><TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
              <TableCell><Chip label={bill.paymentMethod} size="small" color={bill.paymentMethod === "CREDIT" ? "warning" : "primary"} /></TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Rs. {Number(bill.totalAmount).toFixed(2)}</TableCell>
              <TableCell>{bill.items.map((i: any, idx: number) => (<div key={idx}>{i.product?.name} (x{i.quantity})</div>))}</TableCell>
              <TableCell align="center"><Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => generatePDFInvoice(bill)}>Download PDF</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
