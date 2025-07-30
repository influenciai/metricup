
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon?: ReactNode;
  colorClass?: string;
  valueColor?: string;
  animationDelay?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  colorClass = "from-blue-500/20 to-blue-600/5",
  valueColor = "text-foreground",
  animationDelay = "0ms"
}: StatsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div 
      className="metric-card"
      style={{ animationDelay }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={cn("text-2xl font-semibold", valueColor)}>{value}</div>
          <div className={cn(
            "flex items-center text-sm font-medium",
            isPositive ? "text-emerald-600" : "text-red-500"
           )}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{Math.abs(Math.min(999, change)).toFixed(1)}%</span>
            <span className="text-muted-foreground ml-1">vs mês anterior</span>
          </div>
        </div>
        
        {icon && (
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
