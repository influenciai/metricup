
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  TrendingUp, 
  LineChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart4,
  PlusCircle,
  Target,
  AlertTriangle,
  FileText,
  BarChart3,
  Plug,
  Database,
  UserX
} from "lucide-react";
import metricupLogo from "/lovable-uploads/da5e7f09-9c4b-43d3-bfdf-4f9a003ee925.png";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  onClick 
}: SidebarLinkProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md w-full transition-all duration-200",
        active 
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center"
      )}
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState("Dashboard");

  return (
    <div
      className={cn(
        "relative h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-56",
        className
      )}
    >
      <div className="p-4">
        <div className={cn(
          "flex items-center gap-2",
          collapsed && "justify-center"
        )}>
          {!collapsed && (
            <img src={metricupLogo} alt="MetricUp" className="h-8" />
          )}
          {collapsed && (
            <img src={metricupLogo} alt="MetricUp" className="h-8" />
          )}
        </div>
      </div>

      <div className="absolute top-4 -right-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-6 w-6 rounded-full bg-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="px-2 mt-6 space-y-6">
        <div className="space-y-1">
          {/* 1 - Dashboard */}
          <SidebarLink 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeLink === "Dashboard"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Dashboard")}
          />
          {/* 2 - Métricas */}
          <SidebarLink 
            icon={BarChart3} 
            label="Métricas" 
            active={activeLink === "Métricas"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Métricas")}
          />
          {/* 3 - Gerenciar Dados */}
          <SidebarLink 
            icon={Database} 
            label="Gerenciar Dados" 
            active={activeLink === "Gerenciar Dados"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Gerenciar Dados")}
          />
          {/* 4 - Inserir Dados */}
          <SidebarLink 
            icon={PlusCircle} 
            label="Inserir Dados" 
            active={activeLink === "Inserir Dados"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Inserir Dados")}
          />
          {/* 5 - Alertas */}
          <SidebarLink 
            icon={AlertTriangle} 
            label="Alertas" 
            active={activeLink === "Alertas"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Alertas")}
          />
          {/* 6 - Clientes em Atraso */}
          <SidebarLink 
            icon={UserX} 
            label="Clientes em Atraso" 
            active={activeLink === "Clientes em Atraso"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Clientes em Atraso")}
          />
          {/* 7 - Metas */}
          <SidebarLink 
            icon={Target} 
            label="Metas" 
            active={activeLink === "Metas"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Metas")}
          />
          {/* 8 - Integrações */}
          <SidebarLink 
            icon={Plug} 
            label="Integrações" 
            active={activeLink === "Integrações"}
            collapsed={collapsed}
            onClick={() => setActiveLink("Integrações")}
          />
        </div>

        <div className="pt-4 border-t border-sidebar-border">
          <p className={cn(
            "text-xs uppercase text-sidebar-foreground/60 mb-2 px-3",
            collapsed && "text-center"
          )}>
            {collapsed ? "Mais" : "Relatórios"}
          </p>
          <div className="space-y-1">
            <SidebarLink 
              icon={TrendingUp} 
              label="Evolução" 
              active={activeLink === "Evolução"}
              collapsed={collapsed}
              onClick={() => setActiveLink("Evolução")}
            />
            <SidebarLink 
              icon={LineChart} 
              label="Comparativos" 
              active={activeLink === "Comparativos"}
              collapsed={collapsed}
              onClick={() => setActiveLink("Comparativos")}
            />
            <SidebarLink 
              icon={FileText} 
              label="Relatórios" 
              active={activeLink === "Relatórios"}
              collapsed={collapsed}
              onClick={() => setActiveLink("Relatórios")}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 w-full px-2">
        <SidebarLink 
          icon={Settings} 
          label="Settings" 
          active={activeLink === "Settings"}
          collapsed={collapsed}
          onClick={() => setActiveLink("Settings")}
        />
      </div>
    </div>
  );
}
