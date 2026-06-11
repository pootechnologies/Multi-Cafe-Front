import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import ErrorBoundary from "./utils/ErrorBoundary";
import MainLayout from "./components/mainLayout/layout";
import HomePage from "./pages/Dashboard/Home";
import AddProduct from "./pages/Products/AddProduct";
import AddSupplier from "./pages/Suppliers/AddSupplier";
import AddOrder from "./pages/Order/AddOrder";
import ManageProduct from "./pages/Products/ManageProduct";
import ManageSupplier from "./pages/Suppliers/ManageSupplier";
import AddCategory from "./pages/Category/AddCategory";
import ManageCategory from "./pages/Category/ManageCategory";
import ManageUsers from "./pages/Users/ManageUsers";
import Accounts from "./pages/Accounts/Accounts";
import Profile from "./pages/Accounts/Profile";
import { ExportPage } from "./pages/Export/ExportPage";
import CompanyProfile from "./pages/Accounts/CompanyProfile";
import Logs from "./pages/Logs/Logs";
import ManageCustomers from "./pages/Customers/ManageCustomers";
import ManageOrders from "./pages/Order/ManageOrder";
import LoginPage from "./pages/Login";
import AddExpense from "./pages/Expenses/AddExpense";
import ManageExpense from "./pages/Expenses/ManageExpense";
import FilterOrders from "./pages/Order/FilterOrders";
import FilterCredit from "./pages/Order/FilterCredit";
import AddCredit from "./pages/Credit/AddCredit";
import ManageCredit from "./pages/Order/ManageCredit";
import ProductLog from "./pages/Products/ProductLog";
import LinkProduct from "./pages/Products/LinkProduct";
import ManageLinkProduct from "./pages/Products/ManageLinkProduct";
import StockUpdate from "./components/Products/ManageProduct/StockUpdate";
import Performa from "./pages/Performa/Performa";
import ManagePerforma from "./pages/Performa/ManagePerforma";
import PerformaDetailPage from "./pages/Performa/PerformaDetailPage";
import AddCustomerPerformaPage from "./pages/Performa/AddCustomerPerformaPage";
import PerformaDetailProductsPage from "./pages/Performa/PerformaDetailProductsPage";
import AddPerformaProductsPage from "./pages/Performa/AddPerformaProductsPage";
import OrderDetailPage from "./pages/Order/OrderDetailPage";
import AddOrderPage from "./pages/Order/AddOrderPage";
import CreditDetailPage from "./pages/Order/CreditDetailPage";
import AddCreditPage from "./pages/Order/AddCreditPage";
import PurchaseProduct from "./pages/Purchase/PurchaseProduct";
import PurchaseExpense from "./pages/Purchase/PurchaseExpense";
import ExpenseDetailPage from "./pages/Purchase/ExpenseDetailPage";
import SupplierReport from "./pages/Purchase/SupplierReport";
import AddPurchasePage from "./pages/Purchase/AddPurchasePage";
import ExpenseProductPage from "./pages/Purchase/ExpenseProductPage";
import AddExpenseProductPage from "./pages/Purchase/AddExpenseProductPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoading(false);
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("schema_name");
    setIsLoading(false);
  };

  const isAuthenticated = () => {
    return localStorage.getItem("access_token") !== null;
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated() && location.pathname !== "/login")
    return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <HomePage />
            </MainLayout>
          }
        />

        {/* All authenticated routes */}
        <Route
          path="/order_product"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <AddOrder />
            </MainLayout>
          }
        />
        <Route
          path="/manage_order"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <ManageOrders />
            </MainLayout>
          }
        />
        <Route
          path="/manage_customer"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <ManageCustomers />
            </MainLayout>
          }
        />
        <Route
          path="/supplier-report/:id"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <SupplierReport />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout showSidebar={true} onLogout={handleLogout}>
              <Profile />
            </MainLayout>
          }
        />
        {/* Continue with all routes */}
        {[
          "/filter_orders",
          "/update_stock",
          "/filter_credit",
          "/add_expense",
          "/manage_expense",
          "/add_product",
          "/manage_product",
          "/product_log",
          "/link_product",
          "/manage_linked_product",
          "/add_credit",
          "/manage_credit",
          "/performa",
          "/manage_performa",
          "/purchase_product",
          "/purchase_expense",
          "/add_supplier",
          "/manage_supplier",
          "/add_category",
          "/manage_category",
          "/manage_users",
          "/accounts",
          "/company_profile",
          "/logs",
          "/report"
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <MainLayout showSidebar={true} onLogout={handleLogout}>
                {
                  {
                    "/filter_orders": <FilterOrders />,
                    "/update_stock": <StockUpdate />,
                    "/filter_credit": <FilterCredit />,
                    "/add_expense": <AddExpense />,
                    "/manage_expense": <ManageExpense />,
                    "/add_product": <AddProduct />,
                    "/manage_product": <ManageProduct />,
                    "/product_log": <ProductLog />,
                    "/link_product": <LinkProduct />,
                    "/manage_linked_product": <ManageLinkProduct />,
                    "/add_credit": <AddCredit />,
                    "/manage_credit": <ManageCredit />,
                    "/performa": <Performa />,
                    "/manage_performa": <ManagePerforma />,
                    "/purchase_product": <PurchaseProduct />,
                    "/purchase_expense": <PurchaseExpense />,
                    "/add_supplier": <AddSupplier />,
                    "/manage_supplier": <ManageSupplier />,
                    "/add_category": <AddCategory />,
                    "/manage_category": <ManageCategory />,
                    "/manage_users": <ManageUsers />,
                    "/accounts": <Accounts />,
                    "/company_profile": <CompanyProfile />,
                    "/logs": <Logs />,
                    "/report": <ExportPage />,
                  }[path]
                }
              </MainLayout>
            }
          />
        ))}
        {/* Dynamic routes with parameters */}
        {[
          "/add-customer-performa/:customerId",
          "/performa-detail-products/:performaId",
          "/add-performa-products/:performaId",
          "/order-detail/:orderId",
          "/add-order/:orderId",
          "/credit-detail/:creditId",
          "/add-credit/:creditId",
          "/add-purchase/:supplierId",
          "/expense-products/:expenseId",
          "/add-expense-product/:expenseId",
          "/expense-detail",
          "/performa-detail"
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <MainLayout showSidebar={true} onLogout={handleLogout}>
                {
                  {
                    "/add-customer-performa/:customerId": <AddCustomerPerformaPage />,
                    "/performa-detail-products/:performaId": <PerformaDetailProductsPage />,
                    "/add-performa-products/:performaId": <AddPerformaProductsPage />,
                    "/order-detail/:orderId": <OrderDetailPage />,
                    "/add-order/:orderId": <AddOrderPage />,
                    "/credit-detail/:creditId": <CreditDetailPage />,
                    "/add-credit/:creditId": <AddCreditPage />,
                    "/add-purchase/:supplierId": <AddPurchasePage />,
                    "/expense-products/:expenseId": <ExpenseProductPage />,
                    "/add-expense-product/:expenseId": <AddExpenseProductPage />,
                    "/expense-detail": <ExpenseDetailPage />,
                    "/performa-detail": <PerformaDetailPage />,
                  }[path]
                }
              </MainLayout>
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
