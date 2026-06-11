import React, { useEffect, useState } from "react";
import { Plus, Trash, LayoutList, Receipt, CreditCard } from "lucide-react";
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
} from "@react-pdf/renderer";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import Select from "react-select";
import toast from "react-hot-toast";
import ethioFont from "../../assets/ethioFont.ttf";
import { t } from "i18next";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/utils/numberFormaterStats";
import usePerformaStore from "@/store/usePerformaStore";

// Register fonts for PDF (you may need to adjust paths)
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
// Register ethio font
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
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol2: {
    width: "50%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "8%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "10%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
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
    color: "#000",
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
    color: "#4b5563",
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
    borderTopColor: "#000",
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

const Performa = () => {
  // const [items, setItems] = useState([
  //   { productId: "", product: "", unit: "", quantity: 1, unitPrice: "" },
  // ]);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  // const [selectedCustomer, setSelectedCustomer] = useState(null);
  // const [customerName, setCustomerName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  // const [tinNumber, setTinNumber] = useState("");
  // const [fsNumber, setFsNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    tin_number: "",
    vat_number: "",
    zone: "",
    city: "",
    sub_city: "",
  });
  const [companyData, setCompanyData] = useState({
    name: "",
    tin_number: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [selectedReceipt, setSelectedReceipt] = useState("Receipt");
  // const [performaIdFourDigit, setperformaIdFourDigit] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);



  const {
    items,
    selectedCustomer,
    customerName,
    tinNumber,
    fsNumber,
    selectedReceipt,
    performaIdFourDigit,
    addItem,
    removeItem,
    updateItem,
    setSelectedCustomer,
    setSelectedReceipt,
    setPerformaIdFourDigit,
    resetFormZ,
  } = usePerformaStore();


  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {


        const companyResponse = await axiosInstance.get(API_ENDPOINTS.COMPANY);

        setCompanyData(companyResponse.data[0]);

        const customersResponse = await axiosInstance.get(`${API_ENDPOINTS.CUSTOMERS}?include_all=True`);


        setCustomers(customersResponse.data?.all_results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (index, field, value) => {
    updateItem(index, field, value);
  };


  const handleAddMore = () => {
    addItem();
  };

  const handleClearAll = () => {
    // Reset Zustand store
    resetFormZ();

    // Clear localStorage
    localStorage.removeItem('performa-form-storage');
  };



  const handleRemove = (index) => {
    removeItem(index);
 
  };


  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.15;
  };

  const calculateTotal = () => {
    return selectedReceipt === "No Receipt"
      ? calculateSubtotal()
      : calculateSubtotal() + calculateVAT();
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "0.00";
    }
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption?.value || null);
  };


  const handleReceiptChange = (selectedOption) => {
    setSelectedReceipt(selectedOption?.value || "Receipt");
  };


  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCustomer({
      name: "",
      phone: "",
      tin_number: "",
      vat_number: "",
      zone: "",
      city: "",
      sub_city: "",
    });
  };

  // validator

  const areAllItemsValid = () => {
    return items.every(
      (item) =>
        item.product.trim() !== "" &&
        // item.unit.trim() !== "" &&
        item.quantity > 0 &&
        item.unitPrice > 0
    );
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value,
    });
  };

  const handleNewCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMERS, newCustomer);
      if (response.status === 201) {
        toast.success("Customer added successfully!");
        closeModal();
        const fetchCustomers = async () => {
          try {
            const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
            setCustomers(response.data?.results);
          } catch (error) {
            console.error("Error fetching customers:", error);
          }
        };

        fetchCustomers();
      } else {
        toast.error("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer.");
    }
  };

  const handleSubmitPerforma = async (e, showSuccessToast = false) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    try {
      const performaData = {
        customer: selectedCustomer ? selectedCustomer.id : null,
        performas: [
          {
            receipt: selectedReceipt,
            products: items.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unitPrice.toFixed(2),
            })),
          },
        ],
      };
      const response = await axiosInstance.post(API_ENDPOINTS.PERFORMA_CUSTOMER, performaData);
      if (response.status === 201) {
        setPerformaIdFourDigit(response.data.id);
        if (showSuccessToast) {
          toast.success("Performa submitted successfully!");
        }
        return true;
      } else {
        toast.error("Failed to submit performa.");
        return false;
      }
    } catch (error) {
      console.error("Error submitting performa:", error);
      toast.error(error?.response?.data?.customer[0]);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };


  const handlePreviewPDF = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const success = await handleSubmitPerforma(e, false);

    if (success) {
      if (windowWidth >= 768) {
        setShowPDFModal(true);
      } else {
        toast.success("Performa submitted successfully!");
        resetForm();
      }
    }
  };

  // Just call the Zustand action
  const resetForm = () => {
    resetFormZ();
  };


  const MyDoc = ({
    data,
    customer,
    companyData,
    receipt,
    performaIdFourDigit,
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
        (acc, item) => acc + item.quantity * item.unitPrice,
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
      return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
      <Document>
        {itemChunks.map((chunk, chunkIndex) => (
          <Page key={chunkIndex} size="A4" style={styles.page}>
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
                          {performaIdFourDigit ? performaIdFourDigit : ""}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    // alignItems: "center",
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
                        // textDecorationLine: "underline",
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
                      {customer?.name ? customer?.name : ""}
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
                        {formatCurrency(item.unitPrice)}
                      </Text>
                    </View>
                    <View style={styles.tableCol6}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.quantity * item.unitPrice)}
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
                  <Text style={{ fontFamily: "ethio" }}>የገንዘብ መጠን በፊደል</Text>
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
                        <Text style={styles.summaryLabel}>Selling Price</Text>
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
                      color: "#000",
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
    <div className="App grid grid-cols-1 lg:grid-cols-12 gap-5">
      <form className="p-4 col-span-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-5 border-b">
          {t("performa")}
        </h3>

        <div className="fixed top-0 right-0 h-full flex items-center z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-gradient-to-br from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
                <LayoutList className="w-5 h-5" />
              </button>
            </SheetTrigger>

            <SheetContent className="w-full sm:w-[540px] p-6 bg-gradient-to-br from-slate-50 to-white border-l border-slate-200 shadow-2xl">
              <SheetHeader className="mb-6 flex items-center gap-3">
                <SheetTitle className="text-xl font-bold text-gray-800">
                  Performa Summary
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <div className="h-[50vh] overflow-y-auto space-y-4">
                  {items
                    .filter((item) => item.product && item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center"
                      >
                        <div className="flex justify-between items-start ">
                          <div>
                            <p className="text-base font-semibold text-gray-900">
                              {item.product}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                              {/* Move Quantity (Qty) above price */}
                              Qty: {item.quantity} ×{" "}
                              {formatCurrency(item.unitPrice)}
                            </p>
                            <p className="text-right text-lg font-bold text-green-600">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2 border-t pt-4 mb-10">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("number_of_items")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {
                        items.filter(
                          (item) => item.product && item.quantity > 0
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {t("sub_total")}
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  {selectedReceipt !== "No Receipt" && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {t("vat")}
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {formatCurrency(calculateVAT())}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-blue-600 border-t pt-2">
                    <span>{t("total_amount")}</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mb-4">
          <label
            htmlFor="customer-name"
            className="text-sm font-medium text-gray-700 hidden md:block"
          >
            {t("customer_name")}
          </label>
          <div className="space-y-2 md:space-y-0 md:flex flex-row md:items-center md:space-x-5">
            <Select
              isClearable
              id="customer-name"
              options={customers.map((customer) => ({
                label: customer.name,
                value: customer,
              }))}
              onChange={handleCustomerChange}
              value={
                selectedCustomer
                  ? { label: selectedCustomer.name, value: selectedCustomer }
                  : null
              }
              className="w-64"
              placeholder={t("select_customer_name")}
            />
            <Button type="button" onClick={openModal} className="p-2 mt-2 mb-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100">
              <Plus /> {t("add_customers")}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="receipt"
              className="block text-sm font-medium text-gray-700"
            >
              {t("receipt")}
            </label>
            <Select
            isClearable
              id="receipt"
              options={[
                { value: "Receipt", label: "Receipt" },
                { value: "No Receipt", label: "No Receipt" },
              ]}
              onChange={handleReceiptChange}
              value={
                selectedReceipt
                  ? { value: selectedReceipt, label: selectedReceipt }
                  : null
              }
              className=" w-1/2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("choice_receipt")}
            />
          </div>

          <div className=" flex flex-col space-y-4">
            {items.map((item, index) => (
              <ItemRow
                key={`${index}-${item.productId}`}
                index={index}
                item={item}
                products={products}
                handleChange={handleChange}
                handleRemove={handleRemove}
                itemsLength={items.length}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-4 mb-4 flex-row justify-end">
          <Button
            type="button"
            onClick={handleAddMore}
            className="p-2 mb-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
          >
            <Plus className="mr-2" /> {t("add_more")}
          </Button>
          <Button
            type="button"
            onClick={handleClearAll}
            className="p-2 mb-2 rounded-md border border-gray-400 bg-transparent text-red-600 hover:bg-red-50"
          >
            <Trash className="mr-2" /> {t("clear_all")}
          </Button>
          <Button
            type="submit"
            onClick={handlePreviewPDF}
            className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
            disabled={!areAllItemsValid() || calculateTotal() === 0 || isSubmitting}
          >
            {t("submit")}
          </Button>
        </div>

      </form>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:max-w-[1000px]">
            <h2 className="text-lg font-semibold mb-4">
              {t("add_new_customers")}
            </h2>
            <form onSubmit={handleNewCustomerSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto h-[50vh] md:overflow-visible md:h-auto">
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("customer_name")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-name"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("Phone_number")}
                  </label>
                  <input
                    type="tel"
                    id="new-customer-phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-tin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("tin_number")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-tin"
                    name="tin_number"
                    value={newCustomer.tin_number}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-vat"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("vat_number")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-vat"
                    name="vat_number"
                    value={newCustomer.vat_number}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-fs"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("fs_number")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-fs"
                    name="fs_number"
                    value={newCustomer.fs_number}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-zone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("zone")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-zone"
                    name="zone"
                    value={newCustomer.zone}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("city")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-city"
                    name="city"
                    value={newCustomer.city}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="new-customer-sub-city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("sub_city")}
                  </label>
                  <input
                    type="text"
                    id="new-customer-sub-city"
                    name="sub_city"
                    value={newCustomer.sub_city}
                    onChange={handleNewCustomerChange}
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
                >
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  className="bg-black text-white py-2 px-4 rounded-lg"
                  onClick={closeModal}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PDFModal
        isOpen={showPDFModal}
        onClose={() => {
          setShowPDFModal(false);
          resetForm();
        }}
      >
        <PDFViewer width="100%" height="600">
          <MyDoc
            data={items}
            customerName={customerName}
            companyData={companyData}
            customer={selectedCustomer}
            receipt={selectedReceipt}
            performaIdFourDigit={performaIdFourDigit}
          />
        </PDFViewer>
      </PDFModal>
    </div>
  );
};

const ItemRow = React.forwardRef(
  ({ index, item, handleChange, handleRemove, itemsLength }, ref) => {
    const handleProductChange = (e) => {
      const value = e.target.value;
      handleChange(index, "product", value);
    };

    const handleUnitChange = (e) => {
      const value = e.target.value;
      handleChange(index, "unit", value);
    };

    const handleQuantityChange = (e) => {
      const value = e.target.value;
      const quantity = value === "" ? "" : parseInt(value, 10);
      handleChange(index, "quantity", quantity);
    };

    const handleUnitPriceChange = (e) => {
      const value = e.target.value;
      const unitPrice = value === "" ? "" : parseFloat(value);
      handleChange(index, "unitPrice", unitPrice);
    };

    return (
      <div
        ref={ref}
        className="bg-white p-4 rounded-lg border border-gray-300 space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`product-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("product")}
            </label>
            <Input
              type="text"
              id={`product-${index}`}
              value={item.product || ""}
              onChange={handleProductChange}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`unit-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("unit")}
            </label>
            <Input
              type="text"
              id={`unit-${index}`}
              value={item.unit || ""}
              onChange={handleUnitChange}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`quantity-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("quantity")}
            </label>
            <Input
              type="number"
              id={`quantity-${index}`}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`unitPrice-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("unit_price")}
            </label>
            <Input
              type="number"
              id={`unitPrice-${index}`}
              value={item.unitPrice}
              onChange={handleUnitPriceChange}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`totalPrice-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              {t("total_price")}
            </label>
            <Input
              type="text"
              id={`totalPrice-${index}`}
              value={formatCurrency(item.quantity * item.unitPrice)}
              disabled
              className="mt-1 w-full bg-gray-100"
            />
          </div>
        </div>
        {itemsLength > 1 && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={() => handleRemove(index)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash className="mr-2" /> {t("remove")}
            </Button>
          </div>
        )}
        {index < itemsLength - 1 && (
          <hr className="my-4 border-t border-gray-300" />
        )}
      </div>
    );
  }
);

export default Performa;
