import { Button } from "@/components/ui/button";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatTimestamp } from "@/utils/timeFormater";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { Spinner } from "@/components/ui/spinner";
import { t } from "i18next";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Filter,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  Layers,
  LayoutList,
  CreditCard,
  Package,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ExportPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 10;

  // Extract available dates from data (local time)
  const availableDates = useMemo(() => {
    if (!data || data.length === 0) return [];
    const dates = data
      .map((item) => {
        if (!item.order_date) return null;
        const date = new Date(item.order_date);
        return date.toLocaleDateString("en-CA");
      })
      .filter((date) => date !== null);
    return [...new Set(dates)];
  }, [data]);

  // Get min and max dates from availableDates (local time)
  const minDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.min(...availableDates.map((date) => new Date(date).getTime()))
    );
  }, [availableDates]);

  const maxDate = useMemo(() => {
    if (availableDates.length === 0) return null;
    return new Date(
      Math.max(...availableDates.map((date) => new Date(date).getTime()))
    );
  }, [availableDates]);

  // Disable dates not in availableDates (local time)
  const isDateDisabled = (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    return !availableDates.includes(dateStr);
  };

  // Fetch data with date range (only when shouldFetch is true)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API_ENDPOINTS.REPORT}`;
        const params = [];
        if (startDate && endDate) {
          const startDateStr = startDate.toLocaleDateString("en-CA");
          const endDateStr = endDate.toLocaleDateString("en-CA");
          params.push(`start_date=${startDateStr}`);
          params.push(`end_date=${endDateStr}`);
        }
        if (params.length > 0) url += `?${params.join("&")}`;
        const response = await axiosInstance.get(url);

        // Deduplicate and process data
        const processedData = response.data
          .map((item, index) => ({
            ...item,
            id: item.order_id || `temp-id-${index}`,
            product_price: parseFloat(item.product_price) || 0,
            sub_total: parseFloat(item.sub_total) || 0,
            vat: parseFloat(item.vat) || 0,
            total_amount: parseFloat(item.total_amount) || 0,
          }))
          .filter((item, index, self) =>
            index === self.findIndex((t) => t.order_id === item.order_id)
          );

        const sortedData = processedData.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setShouldFetch(false);
      }
    };
    if (shouldFetch) fetchData();
  }, [shouldFetch, startDate, endDate]);

  // Initial fetch without filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.REPORT}`);

        const processedData = response.data
          .map((item, index) => ({
            ...item,
            id: item.order_id || `temp-id-${index}`,
            product_price: parseFloat(item.product_price) || 0,
            sub_total: parseFloat(item.sub_total) || 0,
            vat: parseFloat(item.vat) || 0,
            total_amount: parseFloat(item.total_amount) || 0,
          }))
          .filter((item, index, self) =>
            index === self.findIndex((t) => t.order_id === item.order_id)
          );

        const sortedData = processedData.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side filters
  useEffect(() => {
    let result = [...data];
    if (receiptFilter !== "all") {
      result = result.filter((item) => item.item_receipt === receiptFilter);
    }
    if (filterModel.items.length > 0) {
      result = result.filter((item) =>
        filterModel.items.every((filter) => {
          const value = String(item[filter.field] || "").toLowerCase();
          const filterValue = String(filter.value || "").toLowerCase();
          return value.includes(filterValue);
        })
      );
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [data, filterModel, receiptFilter]);



  // Export Excel/PDF
  const handleExport = () => {
    const exportData =
      receiptFilter !== "all" || filterModel.items.length > 0
        ? filteredData
        : data;

    if (exportFormat === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      const headers = [
        "Order ID",
        "Customer Name",
        "Order Date",
        "Item Receipt",
        "Unit",
        "Product Name",
        "Product Specification",
        "Product Price",
        "Quantity",
        "Sub Total",
        "VAT",
        "Payment Status",
        "Total Amount",
      ];
      worksheet.addRow(headers);

      exportData.forEach((item) => {
        worksheet.addRow([
          item.order_id,
          item.customer_name,
          formatTimestamp(item.order_date),
          item.item_receipt || "-",
          item.unit || "-",
          item.product_name,
          item.product_specification || "-",
          item.product_price,
          item.quantity,
          item.sub_total || 0,
          item.vat || 0,
          item.payment_status || "-",
          item.total_amount || 0,
        ]);
      });

      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const date = new Date().toLocaleTimeString();
        saveAs(blob, `report_${date}.xlsx`);
      });
    } else if (exportFormat === "pdf") {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      // doc.text("Mardi Electronics", doc.internal.pageSize.getWidth() / 2, 10, {
      //   align: "center",
      // });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sales Report", doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      if (startDate || endDate) {
        const start = startDate ? startDate.toLocaleDateString() : "All time";
        const end = endDate ? endDate.toLocaleDateString() : "All time";
        doc.setFontSize(10);
        doc.text(
          `Date Range: ${start} to ${end}`,
          doc.internal.pageSize.getWidth() / 2,
          28,
          { align: "center" }
        );
      }

      const columns = [
        { header: "Order ID", dataKey: "order_id" },
        { header: "Customer Name", dataKey: "customer_name" },
        { header: "Order Date", dataKey: "order_date" },
        { header: "Item Receipt", dataKey: "item_receipt" },
        { header: "Unit", dataKey: "unit" },
        { header: "Product Name", dataKey: "product_name" },
        { header: "Product Specification", dataKey: "product_specification" },
        { header: "Product Price", dataKey: "product_price" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Sub Total", dataKey: "sub_total" },
        { header: "VAT", dataKey: "vat" },
        { header: "Payment Status", dataKey: "payment_status" },
        { header: "Total Amount", dataKey: "total_amount" },
      ];

      const rows = exportData.map((item) => ({
        order_id: item.order_id,
        customer_name: item.customer_name,
        order_date: formatTimestamp(item.order_date),
        item_receipt: item.item_receipt || "-",
        unit: item.unit || "-",
        product_name: item.product_name,
        product_specification: item.product_specification || "-",
        product_price: item.product_price,
        quantity: item.quantity,
        sub_total: item.sub_total || 0,
        vat: item.vat || 0,
        payment_status: item.payment_status || "-",
        total_amount: item.total_amount || 0,
      }));

      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [22, 78, 99], textColor: 255 },
        margin: { top: 20 },
      });

      const totalAmount = exportData.reduce(
        (sum, item) => sum + (item.total_amount || 0),
        0
      );
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total Amount: ${totalAmount.toFixed(2)}`,
        doc.internal.pageSize.getWidth() / 2,
        finalY + 10,
        { align: "center" }
      );

      doc.save(
        `Sales_Report_${new Date().toLocaleDateString()}.pdf`
      );
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setReceiptFilter("all");
    setFilterModel({ items: [] });
    setShouldFetch(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30 dark:bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-blue-600" />
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading report data...</p>
        </div>
      </div>
    );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/30 dark:bg-background p-6">
      <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[24px] border border-rose-200 dark:border-rose-900/30 text-center max-w-md shadow-xl">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-4">
          <X className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Error Loading Report</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-8">Try Again</Button>
      </div>
    </div>
  );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
              {t("report_page")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              Analyze your sales performance, filter data by date, and export comprehensive reports in Excel or PDF formats.
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="relative z-10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Filter className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("filter_options")}</h2>
          </div>

          <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> {t("start_date")}
              </Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  if (date) date.setHours(0, 0, 0, 0);
                  setStartDate(date);
                }}
                filterDate={(date) => !isDateDisabled(date)}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                popperClassName="!z-[9999]"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> {t("end_date")}
              </Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  if (date) date.setHours(0, 0, 0, 0);
                  setEndDate(date);
                }}
                filterDate={(date) => !isDateDisabled(date)}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                popperClassName="!z-[9999]"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            {/* <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" /> {t("filter_by_receipt")}
              </Label>
              <Select value={receiptFilter} onValueChange={setReceiptFilter}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 h-[42px] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40">
                  <SelectValue placeholder="Filter by receipt" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Receipt">Receipt</SelectItem>
                  <SelectItem value="No Receipt">No Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <FileDown className="h-3.5 w-3.5" /> Export Format
              </Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 h-[42px] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 px-6 font-medium transition-all"
            >
              <X className="h-4 w-4 mr-2" /> {t("clear_filter")}
            </Button>
            <Button
              onClick={() => setShouldFetch(true)}
              disabled={!startDate || !endDate}
              className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-11 px-6 font-medium shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" /> Apply Date Filter
            </Button>
            <Button
              onClick={handleExport}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 font-medium shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 ml-auto"
            >
              <FileDown className="h-4 w-4" /> {t("export_report")}
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 pl-8 text-sm whitespace-nowrap">ID</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm whitespace-nowrap">CUSTOMER</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm whitespace-nowrap">DATE</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm whitespace-nowrap">PRODUCT</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm whitespace-nowrap">QTY</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm whitespace-nowrap">TOTAL</th>
                  <th className="text-right font-semibold text-slate-600 dark:text-slate-400 h-14 pr-8 text-sm whitespace-nowrap">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-96">
                      <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-2 shadow-sm border border-blue-100 dark:border-blue-900/50">
                          <LayoutList className="h-10 w-10 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">No report data found</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Try adjusting your filters or date range to see results.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayData.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group h-20">
                      <td className="py-4 pl-8">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Hash className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {item.order_id}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-750 group-hover:border-blue-100 dark:group-hover:border-blue-900 group-hover:text-blue-600 transition-colors shadow-sm">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{item.customer_name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{formatTimestamp(item.order_date)}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.quantity}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(item.total_amount)} ETB</span>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                          item.payment_status === "Paid" 
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
                          : item.payment_status === "Pending" 
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" 
                          : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800"
                        }`}>
                          {item.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {displayData.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
              <span className="text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{displayData.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredData.length}</span> records</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-slate-600 dark:text-slate-400 font-medium px-2">Page {currentPage} of {pageCount || 1}</span>
                <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4 pb-20">
          {displayData.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                <LayoutList className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No report data found</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            displayData.map((item) => (
              <div key={item.id} className={`bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 relative group transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[item.id] ? 'opacity-40 blur-[1px]' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">#{item.order_id}</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-none">{item.customer_name}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-sm ${
                    item.payment_status === "Paid" 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
                    : item.payment_status === "Pending" 
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" 
                    : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800"
                  }`}>
                    {item.payment_status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("order_date")}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatTimestamp(item.order_date)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{t("product_name")}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.product_name}</span>
                  </div>

                  <div className="flex justify-between items-center bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100/30 dark:border-blue-800/30">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("total_amount")}</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(item.total_amount)} ETB</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedCards(prev => prev[item.id] ? {} : { [item.id]: true })}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border-t border-slate-100 dark:border-slate-800 mt-2"
                >
                  {expandedCards[item.id] ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Show Details</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                {expandedCards[item.id] && (
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("receipt")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.item_receipt}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("unit")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("specification")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product_specification}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("product_price")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.product_price)} ETB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("quantity")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("sub_total")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.sub_total)} ETB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t("vat")}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.vat)} ETB</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {displayData.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Showing {displayData.length} of {filteredData.length} records</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 rounded-xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-600 dark:text-slate-400 text-sm font-bold px-2">Page {currentPage} of {pageCount || 1}</span>
                <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-9 rounded-xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 dark:border-black/20"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
