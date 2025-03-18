import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import AjouteAvance from "./AjouteAvance";
import Detailavance from "./Detailavance";
import AfficherAvance from "./AfficheAvance";
import ModifierAvance from "./ModifierAvance";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Icon for viewing
import EditIcon from "@mui/icons-material/Edit"; // Icon for editing
import DeleteIcon from "@mui/icons-material/Delete"; // Icon for deleting
import { frFR } from "@mui/x-data-grid";
import GridToolbarCustom from "../../components/GridToolbarCustom";

function Avance() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useAuth(); // Move this line up to initialize role first

  const customColors = role === "Admin" 
    ? { background: "#3c90f0", hover: "#2a3eb1", tableHeader: "#6da5ee" } // Admin colors
    : { background: "#a0d3e8", hover: "#7ab8d9", tableHeader: "#bcccdf" }; // User colors

  const [data, setData] = useState([]);
  const [contracts, setContracts] = useState([]);
  
  // Etat des dialogues
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailAvanceDialog, setOpenDetailAvanceDialog] = useState(false);
  const [openVoirAvanceDialog, setOpenVoirAvanceDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openModifierDialog, setOpenModifierDialog] = useState(false); // État pour le dialogue de modification
  const [selectedAvanceIds, setSelectedAvanceIds] = useState([]); 
  // Etat pour les avances
  const [newAdvance, setNewAdvance] = useState({
    cin_client: "",
    date: "",
    Numero_contrat: "",
    Numero_avance: "",
  });
  const [selectedAvanceNumber, setSelectedAvanceNumber] = useState(null); 
  const [avanceAModifierId, setAvanceAModifierId] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [detailAvance, setDetailAvance] = useState({
    Numero_avance: "",
    montant: "",
    banque: "",
    mode_reglement: "",
    echeance: "", // New field
    NumeroPiece: "", // New field
  });
  const [avanceToDeleteId, setAvanceToDeleteId] = useState(null);

  const handleVoirAvanceClose = useCallback(
    () => setOpenVoirAvanceDialog(false),
    []
  );

  const handleDeleteConfirm = (avanceId) => {
    setAvanceToDeleteId(avanceId);
    setOpenDeleteDialog(true);
  };

  const handleModifierClick = (avanceId, numeroAvance) => {
    setAvanceAModifierId(avanceId);
    setSelectedAvanceNumber(numeroAvance);
    setOpenModifierDialog(true); // Ouvrir le dialogue de modification
  };

  const handleAvanceModifiee = (avanceModifiee) => {
    setData((prevData) =>
      prevData.map((avance) =>
        avance.id_avance === avanceModifiee.id_avance ? avanceModifiee : avance
      )
    );
  };

  const fetchAvanceDataAndDetailAvance = useCallback(async () => {
    try {
      const avanceResponse = await axios.get("http://localhost:7001/avance");
      if (avanceResponse.status >= 200 && avanceResponse.status < 300) {
        setData(avanceResponse.data.data);
      } else {
        throw new Error("Erreur lors de la récupération des données.");
      }
    } catch (error) {
      console.error("Error fetching avance data:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:7001/contrat");
      if (response.status >= 200 && response.status < 300) {
        setContracts(response.data.data);
      } else {
        throw new Error("Erreur lors de la récupération des contrats.");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  const fetchDetailAvance = useCallback(async (numeroAvance) => {
    try {
      const response = await axios.get(
        `http://localhost:7001/detailAvance/${numeroAvance}`
      );
      if (response.status >= 200 && response.status < 300) {
        setDetailAvance(response.data.data);
      } else {
        throw new Error(
          "Erreur lors de la récupération des détails de l'avance."
        );
      }
    } catch (error) {
      console.error("Error fetching detail avance:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchAvanceDataAndDetailAvance();
    fetchContracts();
  }, [fetchAvanceDataAndDetailAvance, fetchContracts]);

  const generateNextAvanceNumber = useCallback(() => {
    if (data.length > 0) {
      const lastAvanceNumber = data.reduce((max, avance) => {
        const num = parseInt(avance.Numero_avance.replace(/\D/g, ""), 10);
        return num > max ? num : max;
      }, 0);
      return `V${(lastAvanceNumber + 1).toString().padStart(4, "0")}`;
    } else {
      return "V0001";
    }
  }, [data]);

  const handleAddOpen = useCallback(() => {
    const nextAvanceNumber = generateNextAvanceNumber();
    setNewAdvance((prev) => ({ ...prev, Numero_avance: nextAvanceNumber }));
    setOpenAddDialog(true);
  }, [generateNextAvanceNumber]);

  const handleAddClose = useCallback(() => {
    setOpenAddDialog(false);
    setNewAdvance({
      cin_client: "",
      date: "",
      Numero_contrat: "",
      Numero_avance: "",
    });
  }, []);

  const handleVoirClick = useCallback(
    (row) => {
      setSelectedAvanceNumber(row.Numero_avance);
      fetchDetailAvance(row.Numero_avance);
      setOpenVoirAvanceDialog(true);
    },
    [fetchDetailAvance]
  );

  const handleAddAdvance = useCallback(async () => {
    try {
      const advanceToAdd = {
        ...newAdvance,
        cin_client: newAdvance.cin_client,
      };

      const response = await axios.post(
        "http://localhost:7001/avance",
        advanceToAdd
      );
      if (response.status >= 200 && response.status < 300) {
        setData((prevData) => [
          ...prevData,
          { ...response.data.data, id: response.data.data.id_avance },
        ]);
        setSnackbarMessage("Avance ajoutée avec succès !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleAddClose();
        setSelectedAvanceNumber(newAdvance.Numero_avance);
        setOpenDetailAvanceDialog(true);
      } else {
        throw new Error(
          response.data?.message || "Erreur lors de l'ajout de l'avance."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avance:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Erreur lors de l'ajout de l'avance."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [newAdvance, handleAddClose]);

  const handleContractChange = useCallback(
    (event) => {
      const selectedContract = contracts.find(
        (contract) => contract.Numero_contrat === event.target.value
      );
      setNewAdvance((prev) => ({
        ...prev,
        Numero_contrat: event.target.value,
        cin_client: selectedContract ? selectedContract.cin_client : "",
      }));
    },
    [contracts]
  );

  const columns = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      renderCell: (params) => (
        <Checkbox
          checked={selectedAvanceIds.includes(params.row.id_avance)}
          onChange={(event) => {
            const checked = event.target.checked;
            const newSelection = checked
              ? [...selectedAvanceIds, params.row.id_avance]
              : selectedAvanceIds.filter((id) => id !== params.row.id_avance);
            setSelectedAvanceIds(newSelection);
          }}
        />
      )
    },
    { field: "Numero_avance", headerName: "Numéro d'Avance", width: 150 },
    { field: "cin_client", headerName: "CIN Client", width: 150 },
    { field: "date", headerName: "Date", width: 150 },
    { field: "Numero_contrat", headerName: "Numéro de Contrat", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton
            sx={{ color: "#3d59d5", marginRight: 2 }}
            onClick={() => handleVoirClick(params.row)}
            aria-label={`Voir l'avance ${params.row.Numero_avance}`}
          >
            <VisibilityIcon />
          </IconButton>
          {role === "Admin" && (
            <>
              <IconButton
                sx={{ color: "#4caf50", marginRight: 2 }}
                onClick={() =>
                  handleModifierClick(
                    params.row.id_avance,
                    params.row.Numero_avance
                  )
                }
                aria-label={`Modifier l'avance ${params.row.Numero_avance}`}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ color: "#d32f2f", marginRight: 2 }}
                onClick={() => handleDeleteConfirm(params.row.id_avance)}
                aria-label={`Supprimer l'avance ${params.row.Numero_avance}`}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  const handleSnackbarClose = useCallback(() => setSnackbarOpen(false), []);

  const handleDetailAvanceClose = () => {
    setOpenDetailAvanceDialog(false);
    setDetailAvance({
      Numero_avance: "",
      montant: "",
      banque: "",
      mode_reglement: "",
      echeance: "", // New field
      NumeroPiece: "", // New field
    });
    setSelectedAvanceNumber(null);
  };

  const handleAddDetailAvance = async () => {
    try {
      if (
        !detailAvance.banque ||
        !detailAvance.mode_reglement ||
        !detailAvance.montant ||
        !detailAvance.echeance ||
        !detailAvance.NumeroPiece
      ) {
        setSnackbarMessage("Veuillez remplir tous les champs.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const detailToSend = {
        Numero_avance: detailAvance.Numero_avance,
        montant: detailAvance.montant,
        banque: detailAvance.banque,
        mode_reglement: detailAvance.mode_reglement,
        echeance: detailAvance.echeance,
        NumeroPiece: detailAvance.NumeroPiece,
      };

      const response = await axios.post(
        "http://localhost:7001/detailAvance",
        detailToSend
      );

      if (response.status >= 200 && response.status < 300) {
        setSnackbarMessage("Détail d'avance ajouté avec succès !");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleDetailAvanceClose(); // Close the dialog after adding
      } else {
        throw new Error(
          response.data?.message || "Erreur lors de l'ajout du détail d'avance."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du détail d'avance:", error);
      setSnackbarMessage(
        error.response?.data?.message || "Erreur lors de l'ajout du détail d'avance."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteAvance = useCallback(async () => {
    if (!selectedAvanceIds.length) return;

    try {
      // Supprimer les détails associés
      if (selectedDetailId) {
        await axios.delete(`http://localhost:7001/detailAvance/${selectedDetailId}`);
      }

      // Supprimer les avances sélectionnées
      await Promise.all(selectedAvanceIds.map(async (avanceId) => {
          await axios.delete(`http://localhost:7001/avance/${avanceId}`);
      }));

      setSnackbarMessage("Avances et détails supprimés avec succès !");
      setSnackbarSeverity("success");
      setOpenDeleteDialog(false);
      setSelectedAvanceIds([]);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la suppression.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  }, [selectedAvanceIds, selectedDetailId]);
  return (
    <Box m="20px">
      <Header title="Avances" />
      {role === "Admin" && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#3c90f0",
            color: "white",
            fontSize: "0.875rem",
            padding: "10px 20px",
            borderRadius: "20px",
            marginBottom: "20px",
            "&:hover": {
              backgroundColor: "#2a3eb1",
            },
          }}
          onClick={handleAddOpen}
        >
          Ajouter une Avance
        </Button>
      )}
      <Box
        sx={{
          height: "60vh",
          width: "70%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          marginBottom: "20px",
          "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { border: "none" },
            "& .name-column--cell": { color: colors.greenAccent[300] },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#6da5ee",
              borderBottom: "none", 
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: "#6da5ee",
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-iconSeparator": {
              color: colors.primary[100],
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.gray[100]} !important`,
            },
        }}
      >
       <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id_avance}
          checkboxSelection
          onSelectionModelChange={(ids) => setSelectedAvanceIds(ids)}
          components={{
            Toolbar: GridToolbarCustom, // Custom toolbar
          }}
          localeText={{
            ...frFR.components.MuiDataGrid.defaultProps.localeText, // French default localization
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
         
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: customColors.tableHeader,
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: customColors.tableHeader,
              borderTop: "none",
            },
          }}
        />
      </Box>
      <AjouteAvance
        openAddDialog={openAddDialog}
        handleAddClose={handleAddClose}
        newAdvance={newAdvance}
        setNewAdvance={setNewAdvance}
        contracts={contracts}
        handleContractChange={handleContractChange}
        handleAddAdvance={handleAddAdvance}
        data={data}
      />
      {/* Detail avance dialog */}
      <Detailavance
        open={openDetailAvanceDialog}
        onClose={handleDetailAvanceClose}
        avanceOptions={selectedAvanceNumber ? [selectedAvanceNumber] : []}
        detailAvance={detailAvance}
        setDetailAvance={setDetailAvance}
        onAddDetailAvance={handleAddDetailAvance}
        defaultAdvanceNumber={selectedAvanceNumber}
      />
      {/* View avance dialog */}
      <AfficherAvance
        open={openVoirAvanceDialog}
        handleClose={handleVoirAvanceClose}
        selectedAvance={data.find(
          (avance) => avance.Numero_avance === selectedAvanceNumber
        )}
      />
      {/* Modify avance dialog */}
      <ModifierAvance
        open={openModifierDialog}
        handleClose={() => setOpenModifierDialog(false)}
        avanceId={avanceAModifierId}
        numeroAvance={selectedAvanceNumber}
        onAvanceModifiee={handleAvanceModifiee}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmation de Suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cette avance et ses détails ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteAvance} color="secondary">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Avance;