import React from 'react';
import { Box, Grid, Paper, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export const LedgerTab = ({ financials }: any) => {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}><Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e3f2fd", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="primary">Total Assets</Typography><Typography variant="h5" color="primary" fontWeight="bold">Rs. {financials.summary.totalAssets.toFixed(2)}</Typography></Paper></Grid>
        <Grid item xs={12} sm={3}><Paper sx={{ p: 3, textAlign: "center", bgcolor: "#ffebee", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="error">Total Liabilities</Typography><Typography variant="h5" color="error" fontWeight="bold">Rs. {financials.summary.totalLiabilities.toFixed(2)}</Typography></Paper></Grid>
        <Grid item xs={12} sm={3}><Paper sx={{ p: 3, textAlign: "center", bgcolor: "#e8f5e9", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="success.main">Net Profit</Typography><Typography variant="h5" color="success.main" fontWeight="bold">Rs. {financials.summary.netProfit.toFixed(2)}</Typography></Paper></Grid>
        <Grid item xs={12} sm={3}><Paper sx={{ p: 3, textAlign: "center", bgcolor: "#fff3e0", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}><Typography variant="subtitle2" color="warning.dark">Owner Equity</Typography><Typography variant="h5" color="warning.dark" fontWeight="bold">Rs. {financials.summary.equity.toFixed(2)}</Typography></Paper></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="primary">Balance Sheet (Assets & Liabilities)</Typography>
            <TableContainer><Table size="small"><TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>Account</b></TableCell><TableCell align="right"><b>Balance (Rs.)</b></TableCell></TableRow></TableHead><TableBody>{financials.ledgerSummary.ASSET.map((a: any) => (<TableRow key={a.name}><TableCell>{a.name} (Asset)</TableCell><TableCell align="right">Rs. {a.balance.toFixed(2)}</TableCell></TableRow>))}{financials.ledgerSummary.LIABILITY.map((l: any) => (<TableRow key={l.name}><TableCell>{l.name} (Liability)</TableCell><TableCell align="right">Rs. {l.balance.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" gutterBottom color="success.main">Profit & Loss (Income & Expenses)</Typography>
            <TableContainer><Table size="small"><TableHead sx={{ bgcolor: "#f8f9fa" }}><TableRow><TableCell><b>Account</b></TableCell><TableCell align="right"><b>Balance (Rs.)</b></TableCell></TableRow></TableHead><TableBody>{financials.ledgerSummary.INCOME.map((i: any) => (<TableRow key={i.name}><TableCell>{i.name} (Income)</TableCell><TableCell align="right">Rs. {i.balance.toFixed(2)}</TableCell></TableRow>))}{financials.ledgerSummary.EXPENSE.map((e: any) => (<TableRow key={e.name}><TableCell>{e.name} (Expense)</TableCell><TableCell align="right">Rs. {e.balance.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
