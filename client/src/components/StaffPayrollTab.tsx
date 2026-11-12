import React, { useState } from "react";
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, TextField, MenuItem, 
    Dialog, DialogTitle, DialogContent, DialogActions, Grid 
} from "@mui/material";
import { 
    Add as AddIcon, 
    Badge as StaffIcon, 
    CheckCircle as ActiveIcon, 
    PersonAdd as UserIcon,
    EventAvailable as AttendanceIcon, 
    Payment as PayrollIcon 
} from "@mui/icons-material";
import api from "../api/axiosInstance";

interface StaffTabProps {
    staffList: any[];
    setOpenStaffDialog: (open: boolean) => void;
    loadData?: () => void;
}

export function StaffPayrollTab({ 
    staffList, 
    setOpenStaffDialog,
    loadData 
}: StaffTabProps) {
    // Dialog state for User Login Account Creation
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CASHIER");
    const [loadingUser, setLoadingUser] = useState(false);

    // Dialog state for Calendar Attendance
    const [openAttendanceModal, setOpenAttendanceModal] = useState(false);
    const [attStaffId, setAttStaffId] = useState("");
    const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
    const [attStatus, setAttStatus] = useState("PRESENT");
    const [attOvertime, setAttOvertime] = useState("0");

    // Dialog state for Advanced Payroll Disbursement
    const [openPayrollModal, setOpenPayrollModal] = useState(false);
    const [payStaffId, setPayStaffId] = useState("");
    const [payMonth, setPayMonth] = useState("2026-11");
    const [baseSalary, setBaseSalary] = useState("");
    const [deductions, setDeductions] = useState("0");
    const [bonus, setBonus] = useState("0");
    const [incentive, setIncentive] = useState("0");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [payrollNotes, setPayrollNotes] = useState("");

    // Auto-calculate Net Salary (Base - Deductions + Bonus + Incentive)
    const calculatedNetSalary = Math.max(0, 
        Number(baseSalary || 0) - Number(deductions || 0) + Number(bonus || 0) + Number(incentive || 0)
    );

    const handleStaffSelectForPayroll = (id: string) => {
        setPayStaffId(id);
        const selected = staffList.find(s => s.id === Number(id));
        if (selected) {
            setBaseSalary(String(selected.monthlySalary));
        }
    };

    const handleCreateLoginUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingUser(true);
        try {
            await api.post("/users/create", { name, email, password, role });
            setName(""); setEmail(""); setPassword(""); setRole("CASHIER");
            setOpenUserDialog(false);
            if (loadData) loadData();
            alert(`Login account successfully created for ${email}!`);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to create user account.");
        } finally {
            setLoadingUser(false);
        }
    };

    const handleSaveAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/staff/attendance", {
                staffId: Number(attStaffId),
                date: attDate,
                status: attStatus,
                overtimeHrs: Number(attOvertime)
            });
            alert("Attendance marked successfully!");
            setOpenAttendanceModal(false);
            if (loadData) loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to mark attendance.");
        }
    };

    const handleDisbursePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/staff/payroll/disburse", {
                staffId: Number(payStaffId),
                month: payMonth,
                baseSalary: Number(baseSalary),
                deductions: Number(deductions),
                bonus: Number(bonus),
                incentive: Number(incentive),
                paymentMethod,
                notes: payrollNotes
            });
            alert("Salary disbursed successfully & synced with P&L (Operating Expenses)! Dual-entry balanced.");
            setOpenPayrollModal(false);
            if (loadData) loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to disburse salary.");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header Action Bar with Professional Standard Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#0f172a" }}>
                    Advanced Staff Attendance & Payroll Suite
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button variant="outlined" size="small" startIcon={<AttendanceIcon />} onClick={() => setOpenAttendanceModal(true)}>
                        Mark Attendance
                    </Button>
                    <Button variant="outlined" color="success" size="small" startIcon={<PayrollIcon />} onClick={() => setOpenPayrollModal(true)}>
                        Disburse Salary & P&L
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" startIcon={<UserIcon />} onClick={() => setOpenUserDialog(true)}>
                        Create User Account
                    </Button>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenStaffDialog(true)}>
                        Register Staff Record
                    </Button>
                </Box>
            </Box>

            {/* Staff Records Table */}
            <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2, boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <Typography variant="h6" sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "1rem", fontWeight: 600 }}>
                    Registered Store Staff Directory & Performance
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Monthly Salary</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#64748b" }}>
                                        No staff records found. Click "Register Staff Record" to add one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff) => (
                                    <TableRow key={staff.id} hover>
                                        <TableCell sx={{ fontWeight: "600" }}>{staff.name}</TableCell>
                                        <TableCell>{staff.phone}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={staff.role} 
                                                size="small" 
                                                color={staff.role === "ADMIN" ? "error" : staff.role === "STORE_MANAGER" ? "warning" : "primary"} 
                                            />
                                        </TableCell>
                                        <TableCell>Rs. {Number(staff.monthlySalary || 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={<ActiveIcon />} 
                                                label="Active" 
                                                size="small" 
                                                color="success" 
                                                variant="outlined" 
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog Modal 1: Create System Login Account */}
            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    Create System Login Account
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Provision secure email and password credentials for cashiers, managers, or admins to sign into the TradeMatrix ERP application.
                    </Typography>
                    
                    <Box component="form" onSubmit={handleCreateLoginUser} id="create-user-form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField label="Full Name *" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} required />
                        <TextField label="Email Address (Login ID) *" fullWidth type="email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <TextField label="Password *" fullWidth type="password" size="small" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <TextField select label="System Access Role *" fullWidth size="small" value={role} onChange={(e) => setRole(e.target.value)}>
                            <MenuItem value="CASHIER">Cashier (POS & Billing Access)</MenuItem>
                            <MenuItem value="MANAGER">Manager (Operations & Inventory)</MenuItem>
                            <MenuItem value="ADMIN">Admin (Full System & Reports Access)</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button onClick={() => setOpenUserDialog(false)} color="inherit">Cancel</Button>
                    <Button type="submit" form="create-user-form" variant="contained" disabled={loadingUser}>
                        {loadingUser ? "Creating..." : "Save Login Account"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Modal 2: Calendar Attendance Picker */}
            <Dialog open={openAttendanceModal} onClose={() => setOpenAttendanceModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    Mark Daily Staff Attendance
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box component="form" onSubmit={handleSaveAttendance} id="att-form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField select label="Select Staff Member *" fullWidth size="small" value={attStaffId} onChange={(e) => setAttStaffId(e.target.value)} required>
                            <MenuItem value="">-- Choose Staff --</MenuItem>
                            {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.role})</MenuItem>)}
                        </TextField>
                        <TextField label="Attendance Date *" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={attDate} onChange={(e) => setAttDate(e.target.value)} required />
                        <TextField select label="Attendance Status *" fullWidth size="small" value={attStatus} onChange={(e) => setAttStatus(e.target.value)}>
                            <MenuItem value="PRESENT">Present (Full Day)</MenuItem>
                            <MenuItem value="ABSENT">Absent</MenuItem>
                            <MenuItem value="HALF_DAY">Half Day</MenuItem>
                        </TextField>
                        <TextField label="Overtime Hours" type="number" fullWidth size="small" value={attOvertime} onChange={(e) => setAttOvertime(e.target.value)} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button onClick={() => setOpenAttendanceModal(false)} color="inherit">Cancel</Button>
                    <Button type="submit" form="att-form" variant="contained">Save Attendance</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Modal 3: Advanced Salary Disbursement & P&L Sync */}
            <Dialog open={openPayrollModal} onClose={() => setOpenPayrollModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    Disburse Monthly Salary & Sync P&L
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Calculates net payout automatically and posts ledger entries directly into Operating Expenses (P&L) following Dual-Entry standards.
                    </Typography>
                    <Box component="form" onSubmit={handleDisbursePayroll} id="payroll-form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField select label="Select Staff Member *" fullWidth size="small" value={payStaffId} onChange={(e) => handleStaffSelectForPayroll(e.target.value)} required>
                            <MenuItem value="">-- Choose Staff --</MenuItem>
                            {staffList.map(s => <MenuItem key={s.id} value={s.id}>{s.name} (Base: Rs. {s.monthlySalary})</MenuItem>)}
                        </TextField>
                        <TextField label="Payroll Month (YYYY-MM) *" fullWidth size="small" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} required />
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField label="Base Salary (Rs.)" type="number" fullWidth size="small" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} required /></Grid>
                            <Grid item xs={6}><TextField label="Deductions / Advances" type="number" fullWidth size="small" value={deductions} onChange={(e) => setDeductions(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField label="Bonus (Optional)" type="number" fullWidth size="small" value={bonus} onChange={(e) => setBonus(e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField label="Incentive (Optional)" type="number" fullWidth size="small" value={incentive} onChange={(e) => setIncentive(e.target.value)} /></Grid>
                        </Grid>

                        <TextField select label="Payment Mode *" fullWidth size="small" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <MenuItem value="CASH">Cash (From Cash Drawer)</MenuItem>
                            <MenuItem value="BANK">Bank Transfer / UPI</MenuItem>
                        </TextField>

                        <TextField label="Notes / Remarks" multiline rows={2} fullWidth size="small" value={payrollNotes} onChange={(e) => setPayrollNotes(e.target.value)} />

                        {/* Net Salary Preview Box */}
                        <Paper sx={{ p: 2, bgcolor: "#f8fafc", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                            <Typography variant="body2" color="textSecondary">Auto-Calculated Net Payout</Typography>
                            <Typography variant="h5" color="success.main" fontWeight="bold">Rs. {calculatedNetSalary.toFixed(2)}</Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button onClick={() => setOpenPayrollModal(false)} color="inherit">Cancel</Button>
                    <Button type="submit" form="payroll-form" variant="contained" color="success">Confirm & Post to P&L</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}