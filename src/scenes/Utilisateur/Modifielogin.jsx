import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const ModifieLogin = ({ open, handleClose, userId, onUserUpdated, currentLogin }) => {
  const [password, setPassword] = useState(""); // Manage password state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false); // Loading state

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Update password state
  };

  const handleSubmit = async () => {
    if (!password) {
      setSnackbarMessage("Le mot de passe ne peut pas être vide !");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true); // Set loading state
    console.log("Submitting password modification for user:", userId);
    
    try {
      const response = await axios.put(`http://localhost:7001/users/${userId}/login`, { password });
      console.log("Server response:", response); // Log full server response

      if (response.status === 200) {
        onUserUpdated(response.data.data); // Notify parent component
        setSnackbarMessage("Mot de passe modifié avec succès !");
        setSnackbarSeverity("success");
        handleClose(); // Close the dialog after successful update
      } else {
        setSnackbarMessage("Erreur lors de la modification du mot de passe !");
        setSnackbarSeverity("error");
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error updating login:", error);
      
      // Log error details for better debugging
      const errorMsg = error.response?.data?.message || error.message || "Erreur lors de la modification du mot de passe !";
      console.log("Error message from server:", errorMsg);
      
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
    } finally {
      setLoading(false); // Reset loading state
      setSnackbarOpen(true); // Show Snackbar with message
      console.log("Snackbar opened with message:", snackbarMessage); // Log the message to be displayed
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Modifier Mot de Passe</DialogTitle>
      <DialogContent>
        <TextField
          label="Login"
          value={currentLogin} // Display current login
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true, // Make it read-only
          }}
        />
        <TextField
          label="Nouveau Mot de Passe"
          name="password"
          type="password"
          value={password}
          onChange={handlePasswordChange} // Handle password change
          fullWidth
          margin="normal"
          disabled={loading} // Disable input while loading
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? "Modification..." : "Modifier"}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ModifieLogin;