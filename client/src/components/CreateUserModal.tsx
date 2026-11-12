import React, { useState } from "react";
import api from "../api/axiosInstance";

interface CreateUserProps {
    onUserCreated?: () => void;
}

export default function CreateUserModal({ onUserCreated }: CreateUserProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CASHIER");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Calls your newly created backend route /api/users/create
            const response = await api.post("/users/create", {
                name,
                email,
                password,
                role
            });

            setMessage({ text: `Successfully created user: ${response.data.user.email}`, type: "success" });
            setName("");
            setEmail("");
            setPassword("");
            setRole("CASHIER");
            
            if (onUserCreated) onUserCreated();
        } catch (err: any) {
            setMessage({ 
                text: err.response?.data?.error || "Failed to create user account.", 
                type: "error" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: "500px",
            backgroundColor: "#ffffff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            margin: "2rem auto"
        }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>
                Add New Staff / Login User
            </h3>

            {message && (
                <div style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color: message.type === "success" ? "#166534" : "#991b1b",
                    border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5icon", color: "#334155" }}>
                        Full Name
                    </label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="John Doe"
                        style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#334155" }}>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="staff@tradematrix.com"
                        style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#334155" }}>
                        Password
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••"
                        style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#334155" }}>
                        Role
                    </label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                    >
                        <option value="CASHIER">Cashier</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        width: "100%",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        fontWeight: "600",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Creating User..." : "Create User Account"}
                </button>
            </form>
        </div>
    );
}