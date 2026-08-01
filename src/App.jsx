import { lazy, Suspense } from "react";
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

const HomePage = lazy(() => import("./pages/Dashboard/Home"));
const AddProduct = lazy(() => import("./pages/Products/AddProduct"));
const AddSupplier = lazy(() => import("./pages/Suppliers/AddSupplier"));
const AddOrder = lazy(() => import("./pages/Order/AddOrder"));
const ManageProduct = lazy(() => import("./pages/Products/ManageProduct"));
const ManageSupplier = lazy(() => import("./pages/Suppliers/ManageSupplier"));
const AddCategory = lazy(() => import("./pages/Category/AddCategory"));
const ManageCategory = lazy(() => import("./pages/Category/ManageCategory"));
const ManageUsers = lazy(() => import("./pages/Users/ManageUsers"));
const Accounts = lazy(() => import("./pages/Accounts/Accounts"));
const Profile = lazy(() => import("./pages/Accounts/Profile"));
const ExportPage = lazy(() => import("./pages/Export/ExportPage"));
const CompanyProfile = lazy(() => import("./pages/Accounts/CompanyProfile"));
const Logs = lazy(() => import("./pages/Logs/Logs"));
const ManageCustomers = lazy(() => import("./pages/Customers/ManageCustomers"));
const ManageOrders = lazy(() => import("./pages/Order/ManageOrder"));
const LoginPage = lazy(() => import("./pages/Login"));
const AddExpense = lazy(() => import("./pages/Expenses/AddExpense"));
const ManageExpense = lazy(() => import("./pages/Expenses/ManageExpense"));
const FilterOrders = lazy(() => import("./pages/Order/FilterOrders"));
const FilterCredit = lazy(() => import("./pages/Order/FilterCredit"));
const AddCredit = lazy(() => import("./pages/Credit/AddCredit"));
const ManageCredit = lazy(() => import("./pages/Order/ManageCredit"));
const ProductLog = lazy(() => import("./pages/Products/ProductLog"));
const LinkProduct = lazy(() => import("./pages/Products/LinkProduct"));
const ManageLinkProduct = lazy(() => import("./pages/Products/ManageLinkProduct"));
const StockUpdate = lazy(() => import("./components/Products/ManageProduct/StockUpdate"));
const Performa = lazy(() => import("./pages/Performa/Performa"));
const ManagePerforma = lazy(() => import("./pages/Performa/ManagePerforma"));
const PerformaDetailPage = lazy(() => import("./pages/Performa/PerformaDetailPage"));
const AddCustomerPerformaPage = lazy(() => import("./pages/Performa/AddCustomerPerformaPage"));
const PerformaDetailProductsPage = lazy(() => import("./pages/Performa/PerformaDetailProductsPage"));
const AddPerformaProductsPage = lazy(() => import("./pages/Performa/AddPerformaProductsPage"));
const OrderDetailPage = lazy(() => import("./pages/Order/OrderDetailPage"));
const AddOrderPage = lazy(() => import("./pages/Order/AddOrderPage"));
const CreditDetailPage = lazy(() => import("./pages/Order/CreditDetailPage"));
const AddCreditPage = lazy(() => import("./pages/Order/AddCreditPage"));
const PurchaseProduct = lazy(() => import("./pages/Purchase/PurchaseProduct"));
const PurchaseExpense = lazy(() => import("./pages/Purchase/PurchaseExpense"));
const ExpenseDetailPage = lazy(() => import("./pages/Purchase/ExpenseDetailPage"));
const SupplierReport = lazy(() => import("./pages/Purchase/SupplierReport"));
const AddPurchasePage = lazy(() => import("./pages/Purchase/AddPurchasePage"));
const ExpenseProductPage = lazy(() => import("./pages/Purchase/ExpenseProductPage"));
const AddExpenseProductPage = lazy(() => import("./pages/Purchase/AddExpenseProductPage"));
const Permissions = lazy(() => import("./pages/Users/Permissions"));
const AddSubscription = lazy(() => import("./pages/Accounts/AddSubscription"));
const BusinessCategoryManagement = lazy(() => import("./pages/Accounts/BusinessCategoryManagement"));
const ManageBusinessCategory = lazy(() => import("./pages/Accounts/ManageBusinessCategory"));
const ManageSubscriptions = lazy(() => import("./pages/Accounts/ManageSubscriptions"));
const Subscriptions = lazy(() => import("./pages/Accounts/Subscriptions"));
const TenantList = lazy(() => import("./pages/Accounts/TenantList"));
const TenantManagement = lazy(() => import("./pages/Accounts/TenantManagement"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
            "/permissions",
            "/accounts",
            "/company_profile",
            "/logs",
            "/report",
            "/subscription",
            "/add_subscription",
            "/manage_subscriptions",
            "/add_tenant",
            "/tenant_list",
            "/business_categories",
            "/manage_business_categories"
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
                      "/permissions": <Permissions />,
                      "/accounts": <Accounts />,
                      "/company_profile": <CompanyProfile />,
                      "/logs": <Logs />,
                      "/report": <ExportPage />,
                      "/subscription": <Subscriptions />,
                      "/add_subscription": <AddSubscription />,
                      "/manage_subscriptions": <ManageSubscriptions />,
                      "/add_tenant": <TenantManagement />,
                      "/tenant_list": <TenantList />,
                      "/business_categories": <BusinessCategoryManagement />,
                      "/manage_business_categories": <ManageBusinessCategory />
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
                      "/performa-detail": <PerformaDetailPage />
                    }[path]
                  }
                </MainLayout>
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
