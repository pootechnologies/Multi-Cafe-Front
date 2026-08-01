import { Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";

export function TeamSwitcher({ teams }) {
  const [activeTeam] = React.useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group hover:bg-transparent cursor-default"
            >
              {/* Gradient logo badge — emerald */}
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200 shrink-0">
                <activeTeam.logo className="size-4" />
              </div>

              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold text-sm text-slate-800">
                  {activeTeam.name}
                </span>
                <span className="flex items-center gap-1 truncate text-xs text-emerald-600 font-medium">
                  <Sparkles className="w-2.5 h-2.5" />
                  {activeTeam.plan}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}