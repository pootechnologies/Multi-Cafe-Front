import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import Select from "react-select";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import {
  PackageCheck,
  Plus,
  Trash,
  Eye,
  EyeOff,
  Package,
  LayoutList,
  Receipt,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import ethioFont from "../../assets/ethioFont.ttf";
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
import ConfirmOrderModal from "../Order/ConfirmOrderModal";

import useCreditStore from "@/store/useCreditStore";


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

Font.register({
  family: "ethio",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  companyName: {
    fontSize: 9,
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
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 6,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
    fontFamily: "ethio",
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#4b5563",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 3,
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
  tableColNew: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "20%",
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
    paddingRight: 12,
    breakBefore: "auto",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    marginLeft: 9,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    // fontWeight: "bold",
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
    gap: 10,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#000",
  },
  validitySection: {
    marginTop: 20,
    fontSize: 10,
    color: "#000",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    width: 150,
    marginTop: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    color: "#6b7280",
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
  watermark: {
    position: "absolute",
    top: "800%",
    left: "-10%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.3,
    fontSize: 50,
    color: "#9ca3af",
    fontWeight: "bold",
    zIndex: -1,
    whiteSpace: "nowrap",
    width: "400",
  },
  receipt: {
    width: "80mm",
    fontSize: 8,
    fontFamily: "Roboto",
    border: "1px solid black",
    padding: 10,
  },
  headerText: {
    fontSize: 8,
  },
  headerBold: {
    fontSize: 8,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  itemHeader: {
    fontWeight: "bold",
    marginTop: 2,
  },
  dashedBorder: {
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
  footerText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  customFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 5,
    padding: 10,
    color: "#9ca3af",
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const MyDoc = ({
  order,
  products,
  companyData,
  receiptData,
  itemsUnit,
  orderNo,
}) => {
  const customer = receiptData?.customer || {};
  const hasReceipt = order?.receipt === "Receipt";

  const itemsPerFirstPage = hasReceipt ? 15 : 25;
  const itemsPerPage = 30;

  const itemChunks = [];
  if (order.items.length > 0) {
    itemChunks.push(order.items.slice(0, itemsPerFirstPage));

    const remainingItems = order.items.slice(itemsPerFirstPage);

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

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A5"
          style={{ fontSize: "8px", marginTop: chunkIndex > 0 ? 20 : 0 }}
        >
          {/* Render the PDF content using the order data */}
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
                  style={{ width: 80, height: 60 }}
                  src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                  }}
                >
                  {order.vat > 0 && order.items.length <= 10 && <Watermark />}
                  <Text
                    style={{
                      fontFamily: "ethio",
                      marginLeft: 6,
                      fontSize: 9,
                      fontWeight: "bold",
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
                      fontSize: 8,
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
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>Date</Text>
                </View>
              </View>
              {hasReceipt && <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 2,
                  gap: 4,
                  marginRight: 22,
                }}
              >
                <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 8,
                    color: "red",
                    marginRight: 16,
                  }}
                >
                  {orderNo ? orderNo : " "}
                </Text>
              </View>}
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  {order.vat > 0 ? "Attachment Cash Invoice" : "Cash Invoice"}
                </Text>
              </View>

              {order.vat > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: 10,
                    width: "100%",
                    gap: 4,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                >
                  <View style={{ width: "47%" }}>
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 8,
                        textDecoration: "underline",
                      }}
                    >{`ከ፦ ${companyData?.owner_am_name}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      {`From፦ ${companyData?.owner_en_name}`}
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`አድራሻ:- ${companyData?.region} ዞን:-${companyData?.zone} ከተማ:-${companyData?.city} ክ/ከተማ:- ${companyData?.sub_city}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Addr.Reg Zone City Subcity
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የሻጭ ተ.እ.ታ.ቁ፦ ${companyData?.vat_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier Vat No
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      የተመዘገበበት ቀን ___________
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Date of Reg
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`ለ፡ ${customer?.name}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>To</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Vat No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የፊዝካል ደ.ቁ፦ ${customer?.fs_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Fs No
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.tableContainer} breakBefore="avoid">
            {order.vat > 0 && order.items.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#aaaaaa",
                  fontWeight: "bold",
                  zIndex: -1,
                  whiteSpace: "nowrap",
                  width: "400",
                }}
              >
                <Text>ATTACHMENT</Text>
              </View>
            )}
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
                <View style={styles.tableCol3}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ብዛት</Text>
                    <Text style={styles.headerCellLabel}>Quantity</Text>
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
              {chunk.map((item, index) => {
                const product = products.find(
                  (product) => product.id === item.product
                );

                const unitPrice =
                  item.unit_price || product?.selling_price || 0;
                const quantity = item.package
                  ? item.package * product.piece
                  : item.quantity;
                const totalPrice = unitPrice * quantity;

                return (
                  <View key={index} style={[styles.tableRow]}>
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
                      <Text style={styles.tableCell}>
                        {item.product_name ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>
                        {itemsUnit && itemsUnit[index]
                          ? itemsUnit[index]
                          : product?.unit}
                      </Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(unitPrice)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(totalPrice)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {chunkIndex === itemChunks.length - 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 8,
                    marginLeft: 0,
                    maxWidth: 230,
                  }}
                >
                  Amount in Words:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {" "}
                    {convertToWordsWithCurrency(order.total_amount)}
                  </Text>
                </Text>
                <Text
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Other memo or reason for refund____________
                </Text>
                <Text
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Buyer's signture______ Seller's signture______
                </Text>
              </View>

              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      order.items.reduce((acc, item) => {
                        const product = products.find(
                          (p) => p.id === item.product
                        );
                        const unitPrice =
                          item.unit_price || product?.selling_price || 0;
                        const quantity = item.package
                          ? item.package * product.piece
                          : item.quantity;
                        return acc + unitPrice * quantity;
                      }, 0)
                    )}{" "}
                    ETB
                  </Text>
                </View>
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                    <Text style={styles.vatValue}>
                      {formatCurrency(order.vat)} ETB
                    </Text>
                  </View>
                )}
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ጨምሮ ተ.እ.ታ</Text>
                      <Text style={styles.summaryLabel}>
                        Selling Price(Inc.VAT):
                      </Text>
                    </View>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.total_amount)} ETB
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.customFooter}>
            <Text>Powered By Po'o Technologies</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const PDFModal = ({ isOpen, onClose, children, onPDFClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    if (onPDFClose) {
      onPDFClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={handleClose}
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

const AddCredit = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  // const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [tinNumber, setTinNumber] = useState("");
  // const [fsNumber, setFsNumber] = useState("");
  // const [customerName, setCustomerName] = useState("");
  // const [paymentStatus, setPaymentStatus] = useState("Pending");
  // const [paidAmount, setPaidAmount] = useState(0);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [orderResponseData, setOrderResponseData] = useState(null);
  const [orderNo, setOrderNo] = useState(null);


  const {
    items,
    selectedCustomer,
    phoneNumber,
    tinNumber,
    fsNumber,
    customerName,
    paymentStatus,
    paidAmount,
    receipt,
    addItem,
    removeItem,
    updateItem,
    setSelectedCustomer,
    setPhoneNumber,
    setTinNumber,
    setFsNumber,
    setCustomerName,
    setPaymentStatus,
    setPaidAmount,
    setReceipt,
    resetForm,
  } = useCreditStore();




  // const [receipt, setReceipt] = useState(null);
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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPDFAtSubmit, setShowPDFAtSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);

  const { t } = useTranslation();

  const formatter = new Intl.NumberFormat("am-ET", {
    style: "currency",
    currency: "ETB",
  });

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
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS}?include_all=True`);
        setProducts(response.data.all_results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);
        setCompanyData(response.data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
        );
        setCustomers(response?.data?.all_results || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
  };


  const handleProductChange = (index, selectedOption) => {
    const selectedProduct = selectedOption ? selectedOption.value : null;
    updateItem(index, "productInput", selectedOption ? selectedOption.label : "");
    updateItem(index, "selectedProduct", selectedProduct);
    updateItem(index, "quantity", 0);
    updateItem(index, "package", null);
    updateItem(index, "unit_price", selectedProduct ? selectedProduct.selling_price : 0);
    updateItem(index, "unit", selectedProduct ? selectedProduct.unit : "");
    updateItem(index, "stock", selectedProduct ? selectedProduct.stock : 0);
  };


  const handleQuantityChange = (index, event) => {
    const quantity = event.target.value;
    updateItem(index, "quantity", quantity === "" ? 0 : parseInt(quantity, 10));
    updateItem(index, "disabledPackage", quantity !== "");
  };


  const handlePackageChange = (index, event) => {
    const packageValue = event.target.value;
    updateItem(index, "package", packageValue === "" ? null : parseInt(packageValue, 10));
    updateItem(index, "disabledQuantity", packageValue !== "");
  };


  const handleUnitPriceChange = (index, event) => {
    const unitPrice = event.target.value;
    updateItem(index, "unit_price", unitPrice === "" ? "" : parseFloat(unitPrice));
  };


  const handleClearAll = () => {
    resetForm(); // Call the Zustand store's resetForm action
  };



  const calculateSubtotal = () => {
    return items
      .reduce((total, item) => {
        if (item.selectedProduct && (item.quantity > 0 || item.package)) {
          const quantity = item.package
            ? item.package * item.selectedProduct.piece
            : item.quantity;
          const unitPrice =
            item.unit_price || item.selectedProduct.selling_price;
          return total + unitPrice * quantity;
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const calculateVAT = () => {
    const subtotalWithReceipt = items
      .filter(
        (item) =>
          item.selectedProduct &&
          (item.quantity > 0 || item.package) &&
          receipt === "Receipt"
      )
      .reduce((total, item) => {
        const quantity = item.package
          ? item.package * item.selectedProduct.piece
          : item.quantity;
        const unitPrice = item.unit_price || item.selectedProduct.selling_price;
        return total + unitPrice * quantity;
      }, 0);

    return (subtotalWithReceipt * 0.15).toFixed(2);
  };

  const calculateTotalAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const hasSelectedProduct = items.some((item) => item.selectedProduct);
    if (!hasSelectedProduct) {
      toast.error("Please select at least one product.");
      return;
    }

    const hasMissingReceipt = !receipt;
    if (hasMissingReceipt) {
      toast.error("Please select a receipt option.");
      return;
    }

    setShowConfirmOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setShowConfirmOrderModal(false);

    const order = {
      customer: selectedCustomer ? selectedCustomer.id : null,
      total_amount: calculateTotalAmount(),
      phone_number: phoneNumber,
      tin_number: tinNumber,
      fs_number: fsNumber,
      receipt: receipt,
      payment_status: paymentStatus, // Include payment status
      credit: true,
      paid_amount: paidAmount, // Include paid amount
      items: items
        .filter(
          (item) =>
            item.selectedProduct && (item.quantity > 0 || item.package > 0)
        )
        .map((item) => ({
          product: item.selectedProduct.id,
          quantity: item.quantity,
          package: item.package,
          unit_price: item.unit_price || item.selectedProduct.selling_price,
          unit: item.unit,
          price:
            (item.unit_price || item.selectedProduct.selling_price) *
            (item.package
              ? item.package * item.selectedProduct.piece
              : item.quantity),
        })),
    };

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ORDERS, order);
      if (response.status === 201) {
        toast.success("Order made successfully!");
        // Update the state with the response data
        setOrderResponseData(response.data.data);
        setOrderNo(response.data.id);

        // Fetch the updated product data
        const fetchProducts = async () => {
          try {
            const response = await axiosInstance.get(
              `${API_ENDPOINTS.PRODUCTS}?include_all=True`
            );
            setProducts(response.data.all_results || []);
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        };

        await fetchProducts();

        if (windowWidth < 768) {
          resetForm();
        } else {
          setShowPDFAtSubmit(true);
          setShowPDFModal(true);
        }
      } else {
        toast.error("Failed to make order!");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    setShowConfirmOrderModal(false);
    resetForm();
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
            const response = await axiosInstance.get(
              `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
            );
            setCustomers(response?.data?.all_results || []);
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

  const handleReceiptChange = (selectedOption) => {
    setReceipt(selectedOption ? selectedOption.value : null);
  };

  const handleToggle = () => {
    setShowCustomerDetails((prev) => !prev);
  };

  return (
    <div className="relative p-5 bg-white rounded-md  container mb-40">
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
                {t("order_summary")}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-4 pr-2">
                {items
                  .filter(
                    (item) =>
                      item.selectedProduct &&
                      (item.quantity > 0 || item.package)
                  )
                  .map((item, index) => {
                    const quantity = item.package
                      ? item.package * item.selectedProduct.piece
                      : item.quantity;
                    const unitPrice =
                      item.unit_price || item.selectedProduct.selling_price;
                    const totalPrice = quantity * unitPrice;

                    return (
                      <div
                        key={index}
                        className="w-full p-2 bg-white border border-gray-200 transition-all items-center"
                      >
                        <div className="flex justify-between items-start ">
                          <p className="text-base font-semibold text-gray-900">
                            {item.selectedProduct.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {quantity} × {formatter.format(unitPrice)}
                          </p>
                        </div>
                        <p className="text-right text-lg font-bold text-green-600">
                          {formatter.format(totalPrice)}
                        </p>
                      </div>
                    );
                  })}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Number of Items
                  </span>
                  <span className="font-semibold text-gray-800">
                    {
                      items.filter(
                        (item) =>
                          item.selectedProduct &&
                          (item.quantity > 0 || item.package)
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatter.format(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">VAT</span>
                  <span className="font-semibold text-gray-800">
                    {formatter.format(calculateVAT())}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg text-blue-600 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Total Amount</span>
                  </div>
                  <span>{formatter.format(calculateTotalAmount())}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-1 mb-2 border-b">
        {t("place_order")}
      </h3>
      <div>
        <div className="w-full  mb-10 min-h-screen">
          <div className="">
            <div className="flex justify-end lg:w-2/3">
              <Button
                className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
                onClick={openModal}
              >
                <Plus /> {t("add_customers")}
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 w-full lg:w-2/3">
              <div className="space-y-2">
                <label
                  htmlFor="customer-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("customer_name")}
                </label>
                <Select
                isClearable
                  id="customer-name"
                  options={customers.map((customer) => ({
                    label: customer.name,
                    value: customer,
                  }))}
                  placeholder={t("select_customer_name")}
                  onChange={handleCustomerChange}
                  value={
                    selectedCustomer
                      ? {
                        label: selectedCustomer.name,
                        value: selectedCustomer,
                      }
                      : null
                  }
                  className=" w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end mb-0">
                <Button
                  type="button"
                  onClick={handleToggle}
                  variant="outline"
                  size="icon"
                >
                  {showCustomerDetails ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <>
                {showCustomerDetails && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="tin-number"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("tin_number")}
                      </label>
                      <input
                        type="text"
                        id="tin-number"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="fs-tinNumbernumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("fs_number")}
                      </label>
                      <input
                        type="text"
                        id="fs-number"
                        value={fsNumber}
                        onChange={(e) => setFsNumber(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="phone-number"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("Phone_number")}
                      </label>
                      <input
                        type="text"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </>
                )}
              </>
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
                  value={receipt ? { value: receipt, label: receipt } : null}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("choice_receipt")}
                />
              </div>

              <div className=" ">
                <div className="flex flex-col md:flex-row gap-4 mt-4"></div>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-6 mt-6"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor={`product-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("product_name")}
                      </label>
                      <Select
                      isClearable
                        id={`product-${index}`}
                        value={
                          item.selectedProduct
                            ? {
                              label: item.selectedProduct.name,
                              value: item.selectedProduct,
                            }
                            : null
                        }
                        onChange={(selectedOption) =>
                          handleProductChange(index, selectedOption)
                        }
                        options={products.map((product) => ({
                          label: product.name,
                          value: product,
                        }))}
                        placeholder={t("select_product")}
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {item.selectedProduct && (
                      <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor={`unit-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Unit
                          </label>
                          <input
                            type="text"
                            id={`unit-${index}`}
                            value={item.unit}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].unit = e.target.value;
                              setItems(newItems);
                            }}
                            className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`package-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Package
                          </label>
                          <input
                            type="number"
                            id={`package-${index}`}
                            value={item.package || ""}
                            onChange={(e) => handlePackageChange(index, e)}
                            className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={item.disabledPackage}
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor={`unit-price-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {t("unit_price")}
                          </label>
                          <input
                            type="number"
                            id={`unit-price-${index}`}
                            value={item.unit_price}
                            onChange={(e) => handleUnitPriceChange(index, e)}
                            className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-row justify-between">
                            <label
                              htmlFor={`quantity-${index}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              {t("quantity")}
                            </label>

                            <span
                              className={`text-md ${item.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                                }`}
                            >
                              Stock available: {item.stock}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              id={`quantity-${index}`}
                              min="1"
                              required
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => handleQuantityChange(index, e)}
                              className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={item.disabledQuantity}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      {items.length > 1 && (
                        <Button
                          className="bg-[#FF5555] hover:bg-[#f37979]"
                          type="button"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="mr-3" />
                          {t("remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="paymentStatus"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("payment_status")}
                    </label>
                    <select
                      id="paymentStatus"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="Pending">{t("pending")}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="paidAmount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("paid_amount")}
                    </label>
                    <input
                      type="number"
                      id="paidAmount"
                      value={paidAmount}
                      onChange={(e) =>
                        setPaidAmount(parseFloat(e.target.value))
                      }
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-end space-x-5">
                {items.length > 0 && (
                  <Button
                    type="button"
                    onClick={addItem}
                    className="rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="mr-3" />
                    {t("add_more")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-md border border-gray-400 bg-transparent text-red-600 hover:bg-red-50"
                >
                  <Trash className="mr-3" />
                  {t("clear_all")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  <PackageCheck className="mr-3" />
                  {isSubmitting ? "Submitting..." : t("submit_order")}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:max-w-[1000px]">
            <h2 className="text-lg font-semibold mb-4">
              {t("add_new_customers")}
            </h2>
            <form onSubmit={handleNewCustomerSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto  md:overflow-visible md:h-auto">
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
                    VAT Number
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
                    FS Number
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
                    Zone
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
                    City
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
                    Sub City
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

      {showConfirmOrderModal && (
        <ConfirmOrderModal
          isOpen={showConfirmOrderModal}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
        />
      )}

      {showPDFModal && showPDFAtSubmit && (
        <PDFModal
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false);
            resetForm();
          }}
          onPDFClose={resetForm}
        >
          <PDFViewer width="100%" height="600">
            <MyDoc
              orderNo={orderNo}
              order={
                orderResponseData || {
                  customer: selectedCustomer,
                  fs_number: fsNumber,
                  items: items
                    .filter(
                      (item) =>
                        (item.selectedProduct && item.quantity) ||
                        item.package > 0
                    )
                    .map((item) => ({
                      product: item.selectedProduct.id,
                      product_name: item.selectedProduct.name,
                      product_unit: item.selectedProduct.unit,
                      quantity:
                        item.quantity ||
                        item.package * item.selectedProduct.piece,
                      unit_price:
                        item.unit_price || item.selectedProduct.selling_price,
                      price:
                        (item.unit_price ||
                          item.selectedProduct.selling_price) * item.quantity,
                      receipt: receipt,
                    })),
                  subtotal: calculateSubtotal(),
                  vat: calculateVAT(),
                  total_amount: calculateTotalAmount(),
                }
              }
              itemsUnit={items.map((item) => item.unit)}
              products={products}
              companyData={companyData}
              receiptData={{
                customer: selectedCustomer, // Pass the customer data from the state
                items: items
                  .filter((item) => item.selectedProduct && item.quantity > 0)
                  .map((item) => ({
                    product_name: item.selectedProduct.name,
                    product_unit: item.selectedProduct.unit,
                    quantity: item.quantity,
                    unit_price:
                      item.unit_price || item.selectedProduct.selling_price,
                    price:
                      (item.unit_price || item.selectedProduct.selling_price) *
                      item.quantity,
                    receipt: receipt,
                  })),
              }}
            />
          </PDFViewer>
        </PDFModal>
      )}
    </div>
  );
};

export default AddCredit;
