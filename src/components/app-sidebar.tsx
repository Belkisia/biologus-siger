import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Award,
  FileSignature,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Recycle,
  UsersRound,
  Building2,
  FileBarChart,
  Landmark,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard };

const operacao: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Coletas", url: "/coletas", icon: Truck },
  { title: "MTR", url: "/mtr", icon: FileText },
  { title: "Certificados (CDF)", url: "/cdf", icon: Award },
  { title: "Licenças", url: "/licencas", icon: ShieldCheck },
];

const comercial: NavItem[] = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Propostas", url: "/propostas", icon: FileBarChart },
  { title: "Nova Proposta (IA)", url: "/propostas/nova", icon: Sparkles },
  { title: "Proposta PGRSS (IA)", url: "/propostas/pgrss/nova", icon: Sparkles },
  { title: "Preços PGRSS", url: "/precos-pgrss", icon: DollarSign },
  { title: "Contratos", url: "/contratos", icon: FileSignature },
  { title: "Modelos de Contrato", url: "/modelos-contrato", icon: FileText },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Conciliação Bancária", url: "/conciliacao", icon: Landmark },
];

const gestao: NavItem[] = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Usuários", url: "/usuarios", icon: UsersRound },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) => path === url || path.startsWith(url + "/");

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const portalActive = isActive("/portal");

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
        {renderGroup("Operação", operacao)}
        {renderGroup("Comercial", comercial)}
        {renderGroup("Gestão", gestao)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={portalActive}
              className="border border-sidebar-border rounded-md"
            >
              <Link to="/portal" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {!collapsed && (
                  <span className="flex-1 font-medium">Portal do Cliente</span>
                )}
                {!collapsed && (
                  <Building2 className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
