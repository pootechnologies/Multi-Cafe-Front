import React, { useState } from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatDateTypeStamp } from "/src/utils/formatDateTypeStamp.js";
import Pagination from "@mui/material/Pagination";

// Define the fetchLogs function
const fetchLogs = async (rowId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.EXPENSE_LOGS}${rowId}/logs`
  );
  return response.data;
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
};

const ExpenseLogModal = ({ open, onClose, selectedRow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch logs data using useQuery
  const { data, error, isLoading } = useQuery({
    queryKey: ["expenseLogs", selectedRow?.id],
    queryFn: () => fetchLogs(selectedRow.id),
    enabled: !!selectedRow?.id, // Only fetch if selectedRow.id is available
  });

  // Handle loading and error states
  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography>Loading logs...</Typography>
        </Box>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography>Error fetching logs: {error.message}</Typography>
        </Box>
      </Modal>
    );
  }

  // Handle case where selectedRow is not provided
  if (!selectedRow?.id) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography>No expense selected.</Typography>
        </Box>
      </Modal>
    );
  }

  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calculate pagination data
  const pageCount = Math.ceil((data?.length || 0) / itemsPerPage);
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
          Logs for Expense ID: {selectedRow?.id}
        </Typography>
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={displayData || []}
          columns={[
            { field: "id", headerName: "ID", width: 70 },
            { field: "supplier", headerName: "Supplier", width: 150 },
            { field: "change_type", headerName: "Change Type", width: 150 },
            { field: "field_name", headerName: "Field Name", width: 150 },
            { field: "old_value", headerName: "Old Value", width: 150 },
            { field: "new_value", headerName: "New Value", width: 150 },
            {
              field: "timestamp",
              headerName: "Timestamp",
              width: 200,
              valueFormatter: (params) => formatDateTypeStamp(params),
            },
            { field: "user", headerName: "User", width: 150 },
          ]}
          pageSize={itemsPerPage}
          rowsPerPageOptions={[itemsPerPage]}
          autoHeight
        />
        <Pagination
          count={pageCount}
          variant="outlined"
          page={currentPage}
          onChange={handlePageChange}
          className="mt-4 flex justify-center"
        />
      </Box>
    </Modal>
  );
};

export default ExpenseLogModal;
