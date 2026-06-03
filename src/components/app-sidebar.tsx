import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Truck, FileText, FileCheck, FileSignature, DollarSign, BarChart3, Shield, Recycle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const operacional = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Coletas", url: "/coletas", icon: Truck },
  { title: "Contratos", url: "/contratos", icon: FileSignature },
  { title: "MTR", url: "/mtr", icon: FileText },
  { title: "Certificados (CDF)", url: "/cdf", icon: FileCheck },
];

const futuros = [
  { title: "Financeiro", icon: DollarSign },
  { title: "Relatórios", icon: BarChart3 },
  { title: "Licenças", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Recycle className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sidebar-foreground">SIGER PRO</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Gestão de Resíduos
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operacional.map((item) => {
                const active = path === item.url || path.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Em breve</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {futuros.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
