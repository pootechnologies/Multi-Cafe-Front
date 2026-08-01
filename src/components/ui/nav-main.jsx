import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { t } from "i18next";
import { useState } from "react";

export function NavMain({ items }) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});
  const { setOpenMobile } = useSidebar();

  const isActive = (item) => {
    if (item.url && item.url !== "#" && location.pathname === item.url) {
      return true;
    }
    if (item.items) {
      return item.items.some((sub) => location.pathname === sub.url);
    }
    return false;
  };

  const isSubActive = (url) => location.pathname === url;

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SidebarMenu className="px-2 py-1 space-y-0.5">
      {items.map((item) =>
        item.items ? (
          <Collapsible
            key={item.title}
            asChild
            open={openSections[item.title] || isActive(item)}
            onOpenChange={() => toggleSection(item.title)}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <button
                  className={`
                    group/btn w-full flex items-center gap-3 px-1 py-1 rounded-xl text-sm font-medium
                    transition-all duration-200 ease-out cursor-pointer
                    ${
                      isActive(item)
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }
                  `}
                >
                  {/* Icon container */}
                  <span
                    className={`
                      flex items-center justify-center w-7 h-7 rounded-lg shrink-0
                      transition-all duration-200
                      ${
                        isActive(item)
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 group-hover/btn:bg-emerald-100 group-hover/btn:text-emerald-600"
                      }
                    `}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 text-left truncate">{t(item.title)}</span>
                  <ChevronRight
                    className={`
                      w-3.5 h-3.5 shrink-0 transition-transform duration-200
                      ${(openSections[item.title] || isActive(item)) ? "rotate-90" : ""}
                      ${isActive(item) ? "text-white/70" : "text-slate-400 group-hover/btn:text-emerald-500"}
                    `}
                  />
                </button>
              </CollapsibleTrigger>
 
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <SidebarMenuSub className="ml-4 mt-1 border-l-2 border-emerald-100 pl-3 space-y-0.5">
                  {item.items.map((sub) => (
                    <SidebarMenuSubItem key={sub.title}>
                      <Link
                        to={sub.url}
                        onClick={() => setOpenMobile(false)}
                        className={`
                          group/sub flex items-center gap-2.5 px-3 py-1 rounded-lg text-sm
                          transition-all duration-150 ease-out
                          ${
                            isSubActive(sub.url)
                              ? "bg-emerald-50 text-emerald-700 font-semibold"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                          }
                        `}
                      >
                        {/* Active dot indicator */}
                        <span
                          className={`
                            w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-150
                            ${
                              isSubActive(sub.url)
                                ? "bg-emerald-500 scale-125"
                                : "bg-slate-300 group-hover/sub:bg-slate-400"
                            }
                          `}
                        />
                        <span className="truncate">{t(sub.title)}</span>
                        {isSubActive(sub.url) && (
                          <span className="ml-auto w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={item.title}>
            <Link
              to={item.url}
              onClick={() => setOpenMobile(false)}
              className={`
                group/lnk flex items-center gap-3 w-full px-1 py-1 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out
                ${
                  isSubActive(item.url)
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }
              `}
            >
              <span
                className={`
                  flex items-center justify-center w-7 h-7 rounded-lg shrink-0
                  transition-all duration-200
                  ${
                    isSubActive(item.url)
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover/lnk:bg-emerald-100 group-hover/lnk:text-emerald-600"
                  }
                `}
              >
                <item.icon className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{t(item.title)}</span>
            </Link>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
