import React from 'react';
import { Box, Grid, Paper, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export const ReportsTab = ({ reportData, taxReport }: any) => {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e8f5e9", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="success.main">Total Sales Revenue</Typography><Typography variant="h4" color="success.main">Rs. {reportData.totalSalesRevenue.toFixed(2)}</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="textSecondary">Total Transactions</Typography><Typography variant="h4">{reportData.totalTransactions}</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 3, textAlign: "center", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="textSecondary">Inventory Asset Value</Typography><Typography variant="h4">Rs. {reportData.inventoryCostValue.toFixed(2)}</Typography></Paper></Grid>
      </Grid>
      <Paper sx={{ p: 3, mb: 4, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" gutterBottom>GSTR-1 Tax Filing Summary (Tax Slab Breakdown)</Typography>
        <TableContainer><Table size="small"><TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>GST Slab Rate</b></TableCell><TableCell align="right"><b>Taxable Turnover (Rs.)</b></TableCell><TableCell align="right"><b>Tax Collected (Rs.)</b></TableCell></TableRow></TableHead><TableBody>{Object.entries(taxReport.taxSlabs || {}).map(([slab, data]: any) => (<TableRow key={slab}><TableCell><b>{slab}</b></TableCell><TableCell align="right">Rs. {Number(data.taxableAmount).toFixed(2)}</TableCell><TableCell align="right" sx={{ color: "primary.main", fontWeight: "bold" }}>Rs. {Number(data.taxCollected).toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
      </Paper>
    </Box>
  );
};
