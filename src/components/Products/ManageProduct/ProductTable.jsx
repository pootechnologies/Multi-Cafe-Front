import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { MoreVertical, Eye, Pencil, Trash2, ChevronDown, ChevronUp, Search, Filter, Download, Package, Hash, User, Calendar, Tag, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import useUserRoleStore from "@/store/useUserRoleStore";
import { getImageUrl } from "@/utils/imageHelper";

const ProductTable = ({
  products,
  categories,
  onViewClick,
  onUpdateClick,
  onDeleteClick,
  onImageClick,
  onSearch,
  searchTerm,
  noProductsFound,
  isLoadingProducts,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [simplifiedView, setSimplifiedView] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  const { user } = useUserRoleStore();
  const role = user?.role || null;

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  const filteredProducts = sortedProducts.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;
    const matchesSearchTerm = searchTerm
      ? product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearchTerm;
  });

  const totalAmount = allProducts.reduce(
    (acc, product) => acc + product.buying_price * product.stock,
    0
  );

  // FETCH ALL PRODUCTS FOR EXPORT
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        if (Array.isArray(response.data.all_results)) {
          setAllProducts(response?.data?.all_results);
        }
      } catch (err) {
        console.error("Failed to fetch products data", err);
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");
    const startRow = 5;

    if (companyData?.logo) {
      const imageUrl = `${IMAGE_BASE_URL}${companyData.logo}`;
      try {
        const response = await fetch(imageUrl);
        const imageBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: "png",
        });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 200, height: 100 },
        });
      } catch (e) { console.error("Logo fetch failed", e); }
    }

    const redRow = worksheet.getRow(startRow - 4);
    redRow.getCell(1).value = companyData?.am_name;
    redRow.height = 40;
    redRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
    redRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 20 };
    redRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells(`A${startRow - 4}:F${startRow - 4}`);

    const englishNameRow = worksheet.getRow(startRow - 3);
    englishNameRow.getCell(1).value = companyData?.en_name;
    englishNameRow.height = 30;
    englishNameRow.getCell(1).font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    englishNameRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
    englishNameRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells(`A${startRow - 3}:F${startRow - 3}`);

    worksheet.getRow(startRow - 1).values = [
      t("product_name"),
      t("buying_price"),
      t("selling_price"),
      t("stock"),
      t("unit"),
      t("total_price"),
    ];
    worksheet.getRow(startRow - 1).font = { bold: true };

    allProducts.forEach((product, index) => {
      const totalPrice = product.buying_price * product.stock;
      worksheet.getRow(startRow + index).values = [
        product.name,
        product.buying_price,
        product.selling_price,
        product.stock,
        product.unit,
        totalPrice,
      ];
    });

    const grandTotalRowIndex = startRow + allProducts.length + 1;
    worksheet.getRow(grandTotalRowIndex + 1).values = [
      "", "", "", t("grand_total"), totalAmount,
    ];
    worksheet.getRow(grandTotalRowIndex + 1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `products_report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const toggleSimplifiedView = () => {
    setSimplifiedView(!simplifiedView);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
            {t("manage_products")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
            Manage your inventory, track stock levels, and organize products.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {role === "Manager" && (
            <div className="hidden lg:flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-5 py-2.5 rounded-2xl shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider leading-none mb-1">{t("total_amount")}</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">{formatCurrency(totalAmount)} ETB</p>
              </div>
            </div>
          )}
          {role === "Manager" && (
            <Button onClick={exportToExcel} className="h-12 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white font-semibold shadow-lg transition-all flex items-center gap-2 px-6">
              <Download className="h-4 w-4" />
              {t("export_report")}
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 h-14 shadow-sm w-full lg:flex-1">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="search"
            placeholder={t("search_by_product")}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-10"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl px-3 h-14 shadow-sm flex-1 lg:w-[220px]">
            <Layers className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="flex-1 bg-transparent border-0 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer appearance-none pr-6"
            >
              <option value="">{t("all_category")}</option>
              {categories?.results?.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <Button
            onClick={toggleSimplifiedView}
            className={`h-14 px-6 rounded-2xl border transition-all flex items-center gap-2 font-semibold ${
              simplifiedView 
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400" 
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter className="h-4 w-4" />
            {simplifiedView ? t("detailed") : t("simplified")}
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        {isLoadingProducts ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-900/50">
              <Package className="h-10 w-10 opacity-80" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t("no_data_found")}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">No products found matching your search or filters.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                  <tr>
                    <th className="h-14 pl-8 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">PRODUCT</th>
                    <th className="h-14 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">CATEGORY</th>
                    <th className="h-14 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">SPECIFICATION</th>
                    {role === "Manager" && <th className="h-14 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">BUYING PRICE</th>}
                    <th className="h-14 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">SELLING PRICE</th>
                    <th className="h-14 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide">STOCK</th>
                    <th className="h-14 pr-8 font-semibold text-slate-600 dark:text-slate-400 text-sm tracking-wide text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group h-20">
                      <td className="pl-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105 cursor-pointer" onClick={() => onImageClick(product.image)}>
                            {product.image ? (
                              <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><Package className="h-5 w-5" /></div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">{product.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                              <Hash className="h-3 w-3" /> {product.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100/50 dark:border-blue-900/50">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                          {product.specification || "-"}
                        </span>
                      </td>
                      {role === "Manager" && (
                        <td className="py-4">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(product.buying_price)}</span>
                        </td>
                      )}
                      <td className="py-4">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.selling_price)}</span>
                      </td>
                      <td className="py-4">
                        {product.stock === null || product.stock === undefined ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-bold border border-amber-100 dark:border-amber-900/50">
                            {t("no_stock") || "No Stock"}
                          </span>
                        ) : (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${
                            product.stock <= 3 
                            ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}>
                            {product.stock} <span className="text-[10px] opacity-60 uppercase">{product.unit}</span>
                          </div>
                        )}
                      </td>
                      <td className="pr-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onViewClick(product)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => onUpdateClick(product)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDeleteClick(product)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4 p-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" onClick={() => onImageClick(product.image)}>
                        {product.image ? (
                          <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Package className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight mb-1">{product.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-100/50 dark:border-blue-900/50">
                          {product.category_name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">#{product.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{t("selling_price")}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.selling_price)}</p>
                    </div>
                    <div className={`bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border ${product.stock === null || product.stock === undefined ? 'border-amber-200 dark:border-amber-900/50' : product.stock <= 3 ? 'border-rose-200 dark:border-rose-900/50' : 'border-slate-100/50 dark:border-slate-800/50'}`}>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{t("stock")}</p>
                      <p className={`font-bold ${product.stock === null || product.stock === undefined ? 'text-amber-600 dark:text-amber-400' : product.stock <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {product.stock === null || product.stock === undefined ? (
                          t("no_stock") || "No Stock"
                        ) : (
                          <>
                            {product.stock} <span className="text-[9px] opacity-60 ml-0.5">{product.unit}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {expandedCards[product.id] && (
                    <div className="space-y-3 mb-4 animate-in slide-in-from-top-2 duration-300">
                      {role === "Manager" && (
                        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("buying_price")}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(product.buying_price)} ETB</span>
                        </div>
                      )}
                      <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("specification")}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.specification || "N/A"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">{t("description")}</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{product.description || "No description provided."}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">{t("supplier")}</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{product.supplier_name || "N/A"}</span>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">{t("created_by")}</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{product.user}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedCards(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                    className="w-full mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
                  >
                    {expandedCards[product.id] ? (
                      <><span>Hide Details</span><ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <><span>Show Details</span><ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80 dark:border-slate-800">
                    <button onClick={() => onViewClick(product)} className="flex-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-slate-50 dark:bg-slate-800/50 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <Eye className="h-4 w-4" /> {t("view")}
                    </button>
                    <button onClick={() => onUpdateClick(product)} className="flex-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-slate-50 dark:bg-slate-800/50 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <Pencil className="h-4 w-4" /> {t("update")}
                    </button>
                    <button onClick={() => onDeleteClick(product)} className="flex-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-50 dark:bg-slate-800/50 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <Trash2 className="h-4 w-4" /> {t("delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Custom Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredProducts.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{products.count || filteredProducts.length}</span> products
            </span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => onPageChange(null, Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> {t("previous") || "Previous"}
              </Button>
              <span className="text-slate-600 dark:text-slate-400 font-medium px-2">
                {t("page")} {currentPage} of {totalPages || 1}
              </span>
              <Button 
                onClick={() => onPageChange(null, (!totalPages || currentPage >= totalPages ? currentPage : currentPage + 1))} 
                disabled={!totalPages || currentPage >= totalPages} 
                className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm"
              >
                {t("next") || "Next"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
