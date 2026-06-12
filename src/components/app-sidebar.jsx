import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  BarChart,
  Lightbulb,
  Utensils,
  DollarSign,
  Coffee,
  Shield
} from "lucide-react";
import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import { TeamSwitcher } from "@/components/ui/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Po'o Technologies",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Bati Café",
      logo: Coffee,
      plan: "Premium Coffee Shop",
    },
  ],
  navMain: [
    {
      title: "dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "place_order",
      url: "#",
      icon: ShoppingCart,
      items: [{ title: "add_orders", url: "/order_product" }],
    },
    {
      title: "manage_orders",
      url: "#",
      icon: Package,
      items: [
        { title: "manage_orders", url: "/manage_order" },
      ],
    },
    {
      title: "products",
      url: "#",
      icon: Package,
      items: [
        { title: "add_products", url: "/add_product" },
        { title: "manage_products", url: "/manage_product" },
      ],
    },
    {
      title: "categories",
      url: "#",
      icon: Tag,
      items: [
        { title: "add_categories", url: "/add_category" },
        { title: "manage_categories", url: "/manage_category" },
      ],
    },
    {
      title: "customers",
      url: "#",
      icon: Users,
      items: [{ title: "manage_customers", url: "/manage_customer" }],
    },
    {
      title: "reports",
      icon: BarChart,
      items: [{ title: "export_report", url: "/report" }],
    },
    {
      title: "expense",
      icon: DollarSign,
      items: [
        { title: "add_expense", url: "/add_expense" },
        { title: "manage_expense", url: "/manage_expense" },
      ],
    },
    {
      title: "users",
      url: "#",
      icon: Users,
      items: [
        { title: "manage_users", url: "/manage_users" },
        { title: "permissions", url: "/permissions", icon: Shield },
      ],
    }
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar 
      collapsible="icon" 
      {...props} 
      variant="inset"
      className="max-md:bg-slate-50/95 max-md:dark:bg-slate-950/95 max-md:backdrop-blur-xl border-r border-slate-100/50 dark:border-slate-800/50"
    >
      <SidebarHeader className="max-md:p-5 max-md:pb-4 max-md:border-b max-md:border-slate-100/80 max-md:dark:border-slate-900/80">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="max-md:px-4 max-md:py-5">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="max-md:p-5 max-md:pt-4 max-md:border-t max-md:border-slate-100/80 max-md:dark:border-slate-900/80">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
