import React, { useState } from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { formatDateTypeStamp } from "/src/utils/formatDateTypeStamp.js";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";

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

const fetchLogs = async (rowId) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.PURCHASE_SUPPLIERS_LOGS}${rowId}/logs`
  );
  return response.data;
};

const SupplierLogModal = ({ isOpen, onClose, selectedRow }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, error, isLoading } = useQuery({
    queryKey: ["supplierLogs", selectedRow?.id],
    queryFn: () => fetchLogs(selectedRow.id),
    enabled: !!selectedRow?.id, // Only fetch if selectedRow.id is available
  });

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography>Error fetching logs: {error.message}</Typography>;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const pageCount = Math.ceil(data?.length / itemsPerPage);
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
          {t("logs_for_supplier")}: {selectedRow?.supplier_name}
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
            { field: "id", headerName: t("id"), width: 70 },
            { field: "supplier_name", headerName: t("supplier"), width: 150 },
            { field: "change_type", headerName: t("change_type"), width: 150 },
            { field: "field_name", headerName: t("field_name"), width: 150 },
            { field: "old_value", headerName: t("old_value"), width: 150 },
            { field: "new_value", headerName: t("new_value"), width: 150 },
            {
              field: "timestamp",
              headerName: t("timestamp"),
              width: 200,
              valueFormatter: (params) => formatDateTypeStamp(params),
            },
            { field: "user", headerName: t("user"), width: 150 },
          ]}
          pageSize={itemsPerPage}
          rowsPerPageOptions={[itemsPerPage]}
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

export default SupplierLogModal;
