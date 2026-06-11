
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { t } from "i18next";

export function NavMain({ items }) {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();

  const isItemActive = (item) => {
    if (item.url && item.url !== "#") {
      return location.pathname === item.url;
    }
    if (item.items) {
      return item.items.some(subItem => location.pathname === subItem.url);
    }
    return false;
  };

  const isSubItemActive = (subItem) => {
    return location.pathname === subItem.url;
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          // If the item has subitems, make it collapsible, otherwise it's a simple link
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`p-5  ${isItemActive(item) ? 'bg-amber-600/10 dark:bg-amber-500/10' : 'font-semibold'}`}
                    isActive={isItemActive(item)}
                  >
                    {item.icon && <item.icon />}
                    <span className={` ${isItemActive(item) ? "text-amber-600 dark:text-amber-500 font-bold" : ""}`}>
                      {t(item.title)}
                    </span>

                    <ChevronRight
                      className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${isItemActive(item) ? 'text-amber-600 dark:text-amber-500' : ''}`}
                    />

                  </SidebarMenuButton>

                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem)}>
                          <Link
                            to={subItem.url}
                            onClick={() => setOpenMobile(false)}
                            className={isSubItemActive(subItem) ? 'text-amber-600 dark:text-amber-500 font-bold' : 'font-medium'}
                          >
                            <span className="ml-5 font-medium">{t(subItem.title)}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            // For items without subitems (like Dashboard), render as a simple link
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isItemActive(item)}>
                <Link
                  to={item.url}
                  className="flex items-center py-3 "
                  onClick={() => setOpenMobile(false)}
                >
                  {item.icon && <item.icon />}
                  <span>{t(item.title)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
