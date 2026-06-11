import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import usePerformaStore from "@/store/usePerformaStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
    onClick={onCancel}
  >
    <div className="bg-white p-5 rounded-lg w-[90%] max-w-md">
      <h2 className="mb-4 font-bold text-2xl border-b p-1">
        {t("are_you_sure")}
      </h2>
      <p>{t("sure_discription_customer")}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
        >
          {t("delete")}
        </Button>
        <Button
          onClick={onCancel}
          className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
);

function ManagePerforma() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPerforma, setSelectedPerforma] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();
  const setSelectedCustomerPerforma = usePerformaStore(
    (state) => state.setSelectedCustomerPerforma
  );
  const itemsPerPage = 10;

  const {
    data: performas,
    isLoading: isLoadingPerformas,
    refetch,
  } = useQuery({
    queryKey: ["performaCustomers"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.PERFORMA_CUSTOMER)
        .then((res) => res?.data?.results),
    refetchOnWindowFocus: true,
    refetchInterval: 1500,
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const sortedPerformas = Array.isArray(performas)
    ? [...performas].sort((a, b) => b.id - a.id)
    : [];

  const filteredPerformas = sortedPerformas.filter((performa) => {
    const customerName =
      performa.customer_name?.toString().toLowerCase() || "n/a";
    return customerName.includes(searchTerm.toLowerCase());
  });

  const pageCount = Math.ceil(filteredPerformas.length / itemsPerPage);
  const displayPerformas = filteredPerformas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = (id) => {
    setSelectedPerforma(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.PERFORMA_CUSTOMER}${selectedPerforma}`
      );
      toast.success(t("performa customer deleted successfully"));
      refetch();
    } catch (error) {
      toast.error(t("failed to delete performa customer"));
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "customer_name", headerName: t("customer_name"), width: 200 },
    { field: "user", headerName: t("created_by"), width: 200 },
    {
      field: "Actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setSelectedPerforma(params.row.id);
                setSelectedCustomerPerforma(params.row);
                navigate("/performa-detail");
              }}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-green-600" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(params.row.id)}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash className="w-4 h-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container p-3 ml-0 w-[96%]">
      <h1 className="text-lg font-semibold mt-5 border-b mb-2">
        {t("manage_performa")}
      </h1>
      <input
        type="search"
        placeholder={t("search_by_customer_name")}
        className="mb-4 p-2 border border-gray-300 rounded"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {/* Desktop View */}
      <div className="hidden md:block">
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={displayPerformas || []}
          columns={columns}
          loading={isLoadingPerformas}
          disableSelectionOnClick
        />
        <Pagination
          count={pageCount}
          variant="outlined"
          page={currentPage}
          onChange={handlePageChange}
          className="mt-4 flex justify-center"
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {isLoadingPerformas ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          displayPerformas?.map((performa) => (
            <div key={performa.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[performa.id] ? 'opacity-40 blur-sm' : ''}`}>
              <div className="flex justify-between items-start mb-3 pb-3 border-b">
                <div>
                  <h3 className=" text-sm text-gray-900">#{performa.id}</h3>
                  <p className="text-base font-bold  mt-1">{performa.customer_name || "N/A"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSelectedPerforma(performa.id); setSelectedCustomerPerforma(performa); navigate("/performa-detail"); }}>
                      <Eye className="mr-2 h-4 w-4" />{t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(performa.id)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />{t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                  <span className="text-gray-700 font-medium">{t("created_by")}</span>
                  <span className="font-bold text-gray-900">{performa.user}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <Pagination
          count={pageCount}
          variant="outlined"
          page={currentPage}
          onChange={handlePageChange}
          className="mt-4 flex justify-center"
        />
      </div>
      {showConfirmDelete && (
        <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}

export default ManagePerforma;
