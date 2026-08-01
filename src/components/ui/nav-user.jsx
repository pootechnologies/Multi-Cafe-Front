import React from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig";

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    try {
      // Optional: Call backend logout endpoint if available
      if (token && API_ENDPOINTS.LOGOUT) {
        await axiosInstance.post(API_ENDPOINTS.LOGOUT, {});
      }
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      // Clear all user-related data and tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_info");
      localStorage.removeItem("schema_name");
      localStorage.removeItem("isFirstLogin");
      localStorage.removeItem("token");
      localStorage.removeItem("tenant_groups");
      localStorage.removeItem("tenant_permissions");
      // Clear React Query cache
      queryClient.clear();
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {userInfo?.email || "User"}
                </span>
                <span className="truncate text-xs">
                  {userInfo?.tenant || "Tenant"}
                </span>
              </div>
              <LogOut
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}