import React, { useState } from "react";
import { 
    Box, Typography, Paper, Grid, TextField, Button, 
    Divider, Card, CardContent, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip 
} from "@mui/material";
import { 
    Business as BusinessIcon, 
    Palette as BrandingIcon, 
    Add as AddIcon, 
    Save as SaveIcon, 
    CloudUpload as UploadIcon,
    CheckCircle as ActiveIcon 
} from "@mui/icons-material";
import api from "../api/axiosInstance";

interface SettingsTabProps {
    shopSettings: any;
    setShopSettings: (settings: any) => void;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveSettings: () => void;
    businesses: any[];
    activeBusinessId: string;
    handleBusinessChange: (e: any) => void;
    loadData: () => void;
}

export function SettingsTab({ 
    shopSettings, 
    setShopSettings, 
    handleLogoUpload, 
    handleSaveSettings,
    businesses,
    activeBusinessId,
    handleBusinessChange,
    loadData
}: SettingsTabProps) {
    // New Business Dialog State
    const [openBusinessDialog, setOpenBusinessDialog] = useState(false);
    const [newBusinessData, setNewBusinessData] = useState({ name: "", phone: "", address: "", gstin: "" });
    const [loadingBusiness, setLoadingBusiness] = useState(false);

    const handleSaveNewBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingBusiness(true);
        try {
            const res = await api.post("/businesses", newBusinessData);
            const newId = String(res.data.id || res.data.business?.id);
            localStorage.setItem("activeBusinessId", newId);
            setOpenBusinessDialog(false);
            setNewBusinessData({ name: "", phone: "", address: "", gstin: "" });
            loadData();
            alert("New business registered successfully and set as active!");
            window.location.reload(); // Refresh app context for new business entity
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to create business");
        } finally {
            setLoadingBusiness(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "1100px", mx: "auto" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#0f172a" }}>
                Shop Settings & Business Configuration
            </Typography>

            {/* SECTION 1: Register Business & Active Business Switcher */}
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #2563eb" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">1. Business Management & Active Entity</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Manage multiple trading entities, switch your active operating business workspace, or register a new business branch.
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField 
                            select 
                            label="Currently Active Business Workspace *" 
                            fullWidth 
                            size="small"
                            value={activeBusinessId} 
                            onChange={handleBusinessChange}
                        >
                            {businesses.map((b) => (
                                <MenuItem key={b.id} value={String(b.id)}>
                                    {b.name} {String(b.id) === activeBusinessId ? " (Active)" : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => setOpenBusinessDialog(true)}
                            sx={{ py: 1 }}
                        >
                            Register New Business
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* SECTION 2: Shop Branding & Client Settings */}
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #16a34a" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <BrandingIcon color="success" />
                    <Typography variant="h6" fontWeight="bold">2. Branding Shop (Client Shop Settings & Branding)</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Customize store profile details, tax identification numbers, receipt footers, and official brand logos for customer invoices.
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Shop / Business Name *" 
                            fullWidth 
                            size="small"
                            value={shopSettings.shopName || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, shopName: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Store Tagline / Subtitle" 
                            fullWidth 
                            size="small"
                            value={shopSettings.tagline || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, tagline: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Official Contact Phone" 
                            fullWidth 
                            size="small"
                            value={shopSettings.phone || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, phone: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="GSTIN / Tax Registration ID" 
                            fullWidth 
                            size="small"
                            value={shopSettings.gstin || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, gstin: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Store Physical Address" 
                            fullWidth 
                            multiline 
                            rows={2}
                            size="small"
                            value={shopSettings.address || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, address: e.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Invoice Receipt Footer Message" 
                            fullWidth 
                            size="small"
                            value={shopSettings.receiptFooter || ""} 
                            onChange={(e) => setShopSettings({...shopSettings, receiptFooter: e.target.value})} 
                        />
                    </Grid>

                    {/* Logo Branding Upload */}
                    <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                            Upload Store Logo (JPEG/PNG)
                            <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                        </Button>
                        <Typography variant="caption" color="textSecondary">
                            Logo appears automatically at the top of generated PDF POS invoices.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {shopSettings.logoUrl ? (
                            <Box sx={{ border: "1px solid #cbd5e1", p: 1, borderRadius: 1, textAlign: "center", bgcolor: "#f8fafc" }}>
                                <img src={shopSettings.logoUrl} alt="Shop Logo Preview" style={{ maxHeight: "60px", objectFit: "contain" }} />
                                <Typography variant="caption" display="block">Logo Preview</Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="textSecondary">No logo uploaded yet.</Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
                        <Button 
                            variant="contained" 
                            color="success" 
                            size="large" 
                            startIcon={<SaveIcon />}
                            onClick={handleSaveSettings}
                        >
                            Save Branding & Settings
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Dialog Modal: Register New Business */}
            <Dialog open={openBusinessDialog} onClose={() => setOpenBusinessDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    Register New Business Entity
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Create a separate business profile to manage distinct inventory, billing, and accounting ledgers.
                    </Typography>
                    <Box component="form" onSubmit={handleSaveNewBusiness} id="new-business-form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField 
                            label="Business Name *" 
                            fullWidth 
                            size="small"
                            value={newBusinessData.name} 
                            onChange={(e) => setNewBusinessData({...newBusinessData, name: e.target.value})} 
                            required 
                        />
                        <TextField 
                            label="Phone Number" 
                            fullWidth 
                            size="small"
                            value={newBusinessData.phone} 
                            onChange={(e) => setNewBusinessData({...newBusinessData, phone: e.target.value})} 
                        />
                        <TextField 
                            label="Business Address" 
                            fullWidth 
                            multiline 
                            rows={2}
                            size="small"
                            value={newBusinessData.address} 
                            onChange={(e) => setNewBusinessData({...newBusinessData, address: e.target.value})} 
                        />
                        <TextField 
                            label="GSTIN / Tax ID" 
                            fullWidth 
                            size="small"
                            value={newBusinessData.gstin} 
                            onChange={(e) => setNewBusinessData({...newBusinessData, gstin: e.target.value})} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <Button onClick={() => setOpenBusinessDialog(false)} color="inherit">Cancel</Button>
                    <Button type="submit" form="new-business-form" variant="contained" disabled={loadingBusiness}>
                        {loadingBusiness ? "Creating..." : "Create Business"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}