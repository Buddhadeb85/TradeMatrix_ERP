import React, { useState } from "react";
import api from "../api/axiosInstance";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from "@mui/material";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Forgot Password States
    const [openForgotDialog, setOpenForgotDialog] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("businessId", String(user.businessId));
            localStorage.setItem("user", JSON.stringify(user));

            // Instant full-page redirection to refresh application state
            window.location.href = "/";
        } catch (err: any) {
            setError(err.response?.data?.error || "Login failed. Please check your email and password.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetMessage("");

        try {
            const res = await api.post("/auth/forgot-password", { 
                email: resetEmail, 
                newPassword 
            });
            setResetMessage("✅ " + res.data.message);
            setTimeout(() => {
                setOpenForgotDialog(false);
                setResetEmail("");
                setNewPassword("");
                setResetMessage("");
            }, 2000);
        } catch (err: any) {
            setResetMessage("❌ " + (err.response?.data?.error || "Failed to reset password"));
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f1f5f9",
            padding: "1rem"
        }}>
            <form onSubmit={handleLogin} style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#ffffff",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0"
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
                        TradeMatrix ERP
                    </h2>
                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        Sign in to access your point-of-sale system
                    </p>
                </div>
                
                {error && (
                    <div style={{
                        marginBottom: "1.25rem",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        fontSize: "0.875rem",
                        borderRadius: "8px"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", color: "#334155", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="admin@grocerypos.com"
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            outline: "none"
                        }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", color: "#334155", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Password
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            outline: "none"
                        }}
                        required 
                    />
                </div>

                {/* Forgot Password Trigger Link */}
                <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                    <span 
                        onClick={() => setOpenForgotDialog(true)}
                        style={{ fontSize: "0.85rem", color: "#2563eb", cursor: "pointer", fontWeight: 600 }}
                    >
                        Forgot Password?
                    </span>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        width: "100%",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "Signing in..." : "Sign In to POS"}
                </button>
            </form>

            {/* Forgot Password Dialog Modal */}
            <Dialog open={openForgotDialog} onClose={() => setOpenForgotDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>Reset Password</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Enter your registered email address and choose a new password.
                    </Typography>
                    
                    {resetMessage && (
                        <Box sx={{ mb: 2, p: 1, borderRadius: 1, fontSize: "0.85rem", bgcolor: resetMessage.includes("✅") ? "#f0fdf4" : "#fef2f2", color: resetMessage.includes("✅") ? "#166534" : "#991b1b" }}>
                            {resetMessage}
                        </Box>
                    )}

                    <Box component="form" onSubmit={handleResetPassword} id="reset-form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField 
                            label="Registered Email *" 
                            fullWidth 
                            size="small"
                            type="email"
                            value={resetEmail} 
                            onChange={(e) => setResetEmail(e.target.value)} 
                            required 
                        />
                        <TextField 
                            label="New Password *" 
                            fullWidth 
                            size="small"
                            type="password"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenForgotDialog(false)} color="inherit">Cancel</Button>
                    <Button type="submit" form="reset-form" variant="contained" disabled={resetLoading}>
                        {resetLoading ? "Updating..." : "Update Password"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}