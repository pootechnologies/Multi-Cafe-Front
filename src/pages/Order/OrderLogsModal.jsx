import { Modal, Box, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { getBaseURL } from "@/utils/urlHelper";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";

const OrderLogsModal = ({ onClose, selectedRowOrder }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const rowId = selectedRowOrder.id;

  const fetchLogs = async (rowId) => {
    const response = await axiosInstance.get(
      `${getBaseURL()}${API_ENDPOINTS.ORDER_LOGS}${rowId}/logs`
    );
    return response?.data?.results;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["orderLogs", rowId],
    queryFn: () => fetchLogs(rowId),
    enabled: !!rowId,
  });

  const pageCount = Math.ceil(data?.length / itemsPerPage);
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Modal open onClose={onClose}>
      <Box sx={{ ...modalStyle }} className="w-[80%] md:max-w-[60%] rounded-md">
        <Typography variant="h6" component="h2">
          {t("order_log")}
        </Typography>
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
            height: "auto",
          }}
          rows={displayData || []}
          columns={[
            { field: "id", headerName: t("id"), width: 70 },
            { field: "customer", headerName: t("supplier"), width: 150 },
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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default OrderLogsModal;
