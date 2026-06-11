import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import {
  Eye,
  MoreVertical,
  Plus,
  Trash,
  LayoutList,
  Receipt,
  CreditCard,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Pagination from "@mui/material/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/utils/axiosInstance";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import Select from "react-select";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import usePerformaStore from "@/store/usePerformaStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PerformaDetailModal from "./PerformaDetailModal";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import DownloadConfirmationModal from "./DownloadConfirmationModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: "normal",
    },
    {
      src: RobotoBold,
      fontWeight: "bold",
    },
    {
      src: RobotoItalic,
      fontWeight: "normal",
      fontStyle: "italic",
    },
  ],
});
Font.register({
  family: "ethio",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyInfo: {
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyInfoPhone: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 7,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1f2937",
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 12,
    marginBottom: 3,
    fontFamily: "ethio",
  },
  customerNameEthio: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
    fontFamily: "ethio",
    textDecoration: "underline",
  },
  date: {
    fontSize: 10,
    color: "#4b5563",
    alignSelf: "flex-end",
    marginBottom: 5,
    fontFamily: "ethio",
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  table: {
    display: "table",
    width: "95%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 10,
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCol1: {
    width: "8%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  tableCol2: {
    width: "50%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  tableCol3: {
    width: "8%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  tableCol4: {
    width: "10%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  tableCol5: {
    width: "15%",
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 2,
  },
  tableCol6: {
    width: "20%",
    padding: 2,
  },
  headerCellContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
  },
  headerCellNumber: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "ethio",
  },
  headerCellLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    textAlign: "left",
    fontFamily: "ethio",
  },
  tableCellRight: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    textAlign: "right",
  },
  summarySection: {
    paddingLeft: 15,
    paddingRight: 15,
    breakBefore: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  summaryValue: {
    fontSize: 8,
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
    paddingTop: 5,
    gap: 10,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#4b5563",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "semibold",
    color: "#1f2937",
  },
  amountInWords: {
    fontSize: 8,
    marginTop: 10,
    fontStyle: "italic",
    color: "#4b7563",
  },
  validitySection: {
    fontSize: 8,
    color: "#000",
    marginTop: 10,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  signatureLine1: {
    fontFamily: "ethio",
    fontSize: 8,
    fontWeight: "normal",
    color: "#000",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    width: 150,
  },
  signatureText: {
    fontSize: 8,
    textAlign: "center",
    color: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  customFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    color: "#000",
    padding: 10,
  },
});

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

const PerformaDetailPage = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpenExpense, setModalOpenExpense] = useState(false);
  const [showPerformaDetailsModal, setShowPerformaDetailsModal] = useState(false);
  const [selectedPerformaDetailId, setSelectedPerformaDetailId] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [selectedPerforma, setSelectedPerforma] = useState(null);
  const [LogoSrc, setLogoSrc] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [selectedId, setSelectedId] = useState();
  const [fourDegitId, setFourDegitId] = useState();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false);
  const [pdfToDownload, setPdfToDownload] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [performaToDelete, setPerformaToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const selectedCustomerPerforma = usePerformaStore(
    (state) => state.selectedCustomerPerforma
  );
  const performId = selectedCustomerPerforma?.id;
  const queryClient = useQueryClient();

  const { data: performas, isLoading: isLoadingPerformas } = useQuery({
    queryKey: ["performaCustomers", performId, currentPageUrl],
    queryFn: () =>
      axiosInstance
        .get(currentPageUrl || `${API_ENDPOINTS.PERFORMA_CUSTOMER}${performId}`)
        .then((res) => {
          setNextPageUrl(res.data.performas.next);
          setPreviousPageUrl(res.data.performas.previous);
          return res.data;
        }),
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
  });

  const customerPerformas = performas?.performas?.results || [];
  const totalPages = Math.ceil(performas?.performas?.count / itemsPerPage);

  useEffect(() => {
    if (customerPerformas.length > 0) {
      setSelectedId(customerPerformas[0].id);
    }
  }, [customerPerformas]);

  const { data: performaPerforma, isLoading: isLoadingPerformaPerforma } = useQuery({
    queryKey: ["performaPerforma"],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedId}`)
        .then((res) => {
          setFourDegitId(res?.data.id);
          return res?.data;
        }),
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
  });

  const PerformaProducts = performaPerforma?.data?.products || [];

  // Open delete confirmation modal
  const handleDeleteClick = (id) => {
    setPerformaToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  // Confirm delete performa
  const confirmDeletePerforma = async () => {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaToDelete}`
      );
      if (response.status === 200) {
        toast.success("Performa deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["performaCustomers"] });
        queryClient.invalidateQueries({ queryKey: ["performaDetailItems"] });
      } else {
        toast.error("Failed to delete performa");
      }
    } catch (error) {
      console.error("Error deleting performa:", error);
      toast.error("An error occurred while deleting the performa");
    } finally {
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleViewPerforma = async (row) => {
    setPdfToDownload(row);
    if (isMobile) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowDownloadConfirmation(true);
    } else {
      setPdfData(row);
      setShowPDFModal(true);
    }
  };

  const formatPerformaDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleString(undefined, options);
  };

  const handlePageChange = (event, pageNumber) => {
    if (pageNumber > currentPage && nextPageUrl) {
      setCurrentPageUrl(nextPageUrl);
      setCurrentPage(pageNumber);
    } else if (pageNumber < currentPage && previousPageUrl) {
      setCurrentPageUrl(previousPageUrl);
      setCurrentPage(pageNumber);
    }
  };

  const closeModal = () => {
    setShowPerformaDetailsModal(false);
  };

  const openAddPerformaModal = () => {
    navigate(`/add-customer-performa/${selectedCustomerPerforma.id}`);
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);
        const data = response.data[0];
        setCompanyData(data);
        setLogoSrc(data.logo);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleConfirmDownload = async () => {
    if (pdfToDownload) {
      const blob = await pdf(
        <MyDoc
          fourDegitId={fourDegitId}
          selectedPerformaDetailId={selectedPerformaDetailId}
          data={PerformaProducts}
          customer={pdfToDownload.customer}
          companyData={companyData}
          receipt={pdfToDownload.receipt}
        />
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const customerName = pdfToDownload?.customer || "customer";
      link.download = `Performa_${customerName}_${formatPerformaDate(
        pdfToDownload?.issued_date
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadConfirmation(false);
      setPdfToDownload(null);
    }
  };

  const performaColumns = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "customer", headerName: t("customer"), width: 150 },
    {
      field: "issued_date",
      headerName: t("issued_date"),
      width: 150,
      valueFormatter: (params) => formatPerformaDate(params),
    },
    { field: "sub_total", headerName: t("sub_total"), width: 100 },
    { field: "vat", headerName: t("vat"), width: 100 },
    {
      field: "number_of_items",
      headerName: t("number_of_items"),
      width: 150,
    },
    { field: "total", headerName: t("total_amount"), width: 100 },
    { field: "receipt", headerName: t("receipt"), width: 100 },
    { field: "user", headerName: t("user"), width: 100 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <div className="flex flex-col justify-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/performa-detail-products/${params.row.id}`);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>{t("view")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedId(params.row.id);
                  handleViewPerforma(params.row);
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> Performa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(params.row.id)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>{t("delete")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const MyDoc = ({
    data,
    customer,
    companyData,
    receipt,
    fourDegitId,
  }) => {
    const itemsPerFirstPage = 35;
    const itemsPerPage = 35;
    const itemChunks = [];
    if (data.length > 0) {
      itemChunks.push(data.slice(0, itemsPerFirstPage));
      const remainingItems = data.slice(itemsPerFirstPage);
      let currentChunk = [];
      remainingItems.forEach((item, index) => {
        currentChunk.push(item);
        if (currentChunk.length >= itemsPerPage) {
          itemChunks.push(currentChunk);
          currentChunk = [];
        }
      });
      if (currentChunk.length > 0) {
        itemChunks.push(currentChunk);
      }
    }
    const calculateSubtotal = (items) => {
      return items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
      );
    };
    const calculateVAT = (items) => {
      return calculateSubtotal(items) * 0.15;
    };
    const calculateTotal = (items) => {
      return receipt === "No Receipt"
        ? calculateSubtotal(items)
        : calculateSubtotal(items) + calculateVAT(items);
    };
    const formatCurrency = (amount) => {
      return amount?.toFixed(2)?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    return (
      <Document>
        {itemChunks?.map((chunk, chunkIndex) => (
          <Page
            key={chunkIndex}
            size="A4"
            style={{ marginTop: chunkIndex > 0 ? 20 : 0 }}
          >
            {chunkIndex === 0 && (
              <>
                <View
                  style={[
                    styles.header,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: 10,
                      paddingRight: 10,
                      marginBottom: 0,
                      paddingBottom: 0,
                    },
                  ]}
                >
                  <Image
                    style={{ width: 100, height: 80 }}
                    src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                  />
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "80%",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "ethio",
                        marginLeft: 5,
                        fontSize: 11,
                      }}
                    >
                      {companyData?.am_name}
                    </Text>
                    <Text style={styles.companyName}>
                      {companyData?.en_name || ""}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.companyInfoPhone}>
                        {companyData?.phone1} {" / "} {companyData?.phone2}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginRight: 19,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 10,
                        textDecoration: "underline",
                      }}
                    >
                      ቀን:{" "}
                      {new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                      Date
                    </Text>
                    <View
                      style={{ flexDirection: "row", marginTop: 2, gap: 4 }}
                    >
                      <Text style={{ fontFamily: "ethio", fontSize: 10 }}>
                        No:{" "}
                        <Text style={{ color: "red" }}>
                          {fourDegitId ? fourDegitId : ""}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginLeft: 15,
                  }}
                >
                  <View style={{ flexDirecion: "column" }}>
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 10,
                        marginLeft: 20,
                        fontWeight: "bold",
                        justifyContent: "center",
                        marginTop: 4,
                      }}
                    >
                      {companyData?.owner_am_name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 10,
                        marginLeft: 20,
                      }}
                    >
                      Tin No:{" "}
                      <Text
                        style={{
                          fontFamily: "ethio",
                          fontSize: 10,
                          marginLeft: 20,
                          fontWeight: "bold",
                          textDecoration: "underline",
                        }}
                      >
                        {companyData?.tin_number ? companyData?.tin_number : ""}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "ethio",
                        textDecoration: "underline",
                        fontSize: 15,
                        fontWeight: "bold",
                        textAlign: "center",
                        marginLeft: "150px",
                      }}
                    >
                      የዋጋ ማቅረቢያ
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        textAlign: "center",
                        textDecoration: "underline",
                        marginLeft: "150px",
                      }}
                    >
                      Performa
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 10,
                      fontWeight: "bold",
                      marginLeft: 35,
                    }}
                  >
                    ለ፦
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 10,
                        fontWeight: "bold",
                        marginLeft: 2,
                        textDecoration: "underline",
                      }}
                    >
                      {" "}
                      {customer ? customer : ""}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      marginLeft: 34,
                      fontSize: 10,
                    }}
                  >
                    To
                  </Text>
                </View>
              </>
            )}
            <View style={styles.tableContainer} breakBefore="avoid">
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={styles.tableCol1}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>ተ.ቁ</Text>
                      <Text style={styles.headerCellLabel}>No</Text>
                    </View>
                  </View>
                  <View style={styles.tableCol2}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>የእቃው አይነት</Text>
                      <Text style={styles.headerCellLabel}>Description</Text>
                    </View>
                  </View>
                  <View style={styles.tableCol3}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>መለኪያ</Text>
                      <Text style={styles.headerCellLabel}>Unit</Text>
                    </View>
                  </View>
                  <View style={styles.tableCol4}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>ብዛት</Text>
                      <Text style={styles.headerCellLabel}>Qty</Text>
                    </View>
                  </View>
                  <View style={styles.tableCol5}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>የአንድ ዋጋ</Text>
                      <Text style={styles.headerCellLabel}>Unit Price</Text>
                    </View>
                  </View>
                  <View style={styles.tableCol6}>
                    <View style={styles.headerCellContent}>
                      <Text style={styles.headerCellNumber}>ጠቅላላ ዋጋ</Text>
                      <Text style={styles.headerCellLabel}>Total Price</Text>
                    </View>
                  </View>
                </View>
                {chunk.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.tableCol1}>
                      <Text style={styles.tableCell}>
                        {index +
                          1 +
                          (chunkIndex > 0
                            ? itemsPerFirstPage +
                            (chunkIndex - 1) * itemsPerPage
                            : 0)}
                      </Text>
                    </View>
                    <View style={styles.tableCol2}>
                      <Text style={styles.tableCell}>{item.product}</Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{item.unit}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(+item.unit_price)}
                      </Text>
                    </View>
                    <View style={styles.tableCol6}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(+item.quantity * +item.unit_price)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {chunkIndex === itemChunks.length - 1 && (
              <View style={styles.summarySection} breakBefore="avoid">
                <View
                  style={{
                    flexDirection: "column",
                    fontSize: 8,
                    maxWidth: 230,
                  }}
                >
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                    የገንዘብ መጠን በፊደል
                  </Text>
                  <Text>
                    Amount in Words:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {convertToWordsWithCurrency(calculateTotal(data))}{" "}
                    </Text>
                  </Text>
                </View>
                <View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(calculateSubtotal(data))} ETB
                    </Text>
                  </View>
                  {receipt !== "No Receipt" && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(calculateVAT(data))} ETB
                      </Text>
                    </View>
                  )}
                  {receipt !== "No Receipt" && (
                    <View style={styles.totalRow}>
                      <View style={{ flexDirection: "column" }}>
                        <Text style={styles.summaryLabel}>
                          ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ
                        </Text>
                        <Text
                          style={{
                            fontFamily: "ethio",
                            fontSize: 8,
                            fontWeight: "bold",
                          }}
                        >
                          Selling Price
                        </Text>
                      </View>
                      <Text style={styles.totalValue}>
                        {formatCurrency(calculateTotal(data))} ETB
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            {chunkIndex === itemChunks.length - 1 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  paddingLeft: 13,
                  paddingRight: 13,
                }}
              >
                <View style={styles.validitySection} breakBefore="avoid">
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      fontFamily: "ethio",
                    }}
                  >
                    ይህ ዋጋ ማቅረቢያ የሚያገለግለው ለ______________ ቀን ብቻ ነው።
                  </Text>
                  <Text>
                    The validity of this performa invoice is for ______________
                    days only.
                  </Text>
                </View>
                <View style={styles.signatureSection} breakBefore="avoid">
                  <View>
                    <Text style={styles.signatureLine1}>
                      ፊርማ ______________
                    </Text>
                    <Text style={styles.signatureText}>Signature</Text>
                  </View>
                </View>
              </View>
            )}
            <View style={styles.customFooter}>
              <Text style={{ fontSize: 5, color: "#9ca3af" }}>
                Powered By Po'o Technologies
              </Text>
            </View>
          </Page>
        ))}
      </Document>
    );
  };

  const PDFModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "auto", width: "100%" }}>
      <div className="container-padding">
        <h1 className="px-4 font-bold mt-4 mb-4 border-b p-1">
          {t("manage_performa")}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="cursor-pointer">
              <BreadcrumbLink onClick={() => navigate("/manage_performa")}>
                <span className="px-4 font-bold mt-4 mb-4">
                  {t("manage_performa")}
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("performa_details")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-600" />
          <span className="font-bold text-lg text-gray-800">
            {t("customer")}:
          </span>
          <span className="font-medium text-gray-700">
            {selectedCustomerPerforma.customer_name
              ? selectedCustomerPerforma.customer_name
              : "N/A"}
          </span>
        </div>
        <div className="flex justify-end mt-2 mb-2">
          <Button
            className="p-2 mt-2 mb-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
            onClick={openAddPerformaModal}
          >
            {t("add_performa")}
          </Button>
        </div>
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
            loading={isLoadingPerformas}
            rows={customerPerformas}
            columns={performaColumns}
            pageSize={itemsPerPage}
            rowsPerPageOptions={[itemsPerPage]}
            getRowId={(row) => row.id}
          />
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          {isLoadingPerformas ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            customerPerformas?.map((performa) => (
              <div key={performa.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[performa.id] ? 'opacity-40 blur-sm' : ''}`}>
                <div className="flex justify-between items-start mb-3 pb-3 border-b">
                  <div>
                    <h3 className="text-sm text-gray-900">#{performa.id}</h3>
                    <p className="text-base font-bold mt-1">{performa.customer || "N/A"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => { navigate(`/performa-detail-products/${performa.id}`); }}>
                        <Eye className="mr-2 h-4 w-4" />{t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedId(performa.id); handleViewPerforma(performa); }}>
                        <Eye className="mr-2 h-4 w-4" />Performa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(performa.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />{t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("issued_date")}</span>
                    <span className="font-medium text-gray-900">{formatPerformaDate(performa.issued_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("receipt")}</span>
                    <span className="font-medium text-gray-900">{performa.receipt}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                    <span className="text-gray-700 font-medium">{t("total_amount")}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(performa.total)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("user")}</span>
                    <span className="font-medium text-gray-900">{performa.user}</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedCards(prev => {
                    const isCurrentlyExpanded = prev[performa.id];
                    return isCurrentlyExpanded ? {} : { [performa.id]: true };
                  })}
                  className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {expandedCards[performa.id] ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Details</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>

                {expandedCards[performa.id] && (
                  <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("number_of_items")}</span>
                      <span className="font-medium text-gray-900">{performa.number_of_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("sub_total")}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(performa.sub_total)} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("vat")}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(performa.vat)} ETB</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Pagination
        count={totalPages}
        variant="outlined"
        page={currentPage}
        onChange={handlePageChange}
        className="mt-4 flex justify-center"
      />

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          onClick={() => setIsConfirmDeleteOpen(false)}
        >
          <div
            className="bg-white p-5 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-2xl border-b p-1">
              {t("are_you_sure")}
            </h2>
            <p>{t("sure_discription_performa")}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={confirmDeletePerforma}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("delete")}
              </Button>
              <Button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PerformaDetailModal
        showPerformaDetailsModal={showPerformaDetailsModal}
        selectedPerformaDetailId={selectedPerformaDetailId}
        closeModal={closeModal}
      />
      {showDownloadConfirmation && (
        <DownloadConfirmationModal
          isOpen={showDownloadConfirmation}
          onClose={() => {
            setShowDownloadConfirmation(false);
            setPdfToDownload(null);
          }}
          onConfirm={handleConfirmDownload}
        />
      )}
      <PDFModal isOpen={showPDFModal} onClose={() => setShowPDFModal(false)}>
        <PDFViewer width="100%" height="600">
          {pdfData && (
            <MyDoc
              fourDegitId={fourDegitId}
              selectedPerformaDetailId={selectedPerformaDetailId}
              data={PerformaProducts}
              customer={pdfData.customer}
              companyData={companyData}
              receipt={pdfData.receipt}
            />
          )}
        </PDFViewer>
      </PDFModal>
    </div>
  );
};

export default PerformaDetailPage;
