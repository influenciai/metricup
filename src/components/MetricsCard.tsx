import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: ReactNode;
  colorClass?: string;
  animationDelay?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon, 
  colorClass = "from-blue-500/20 to-blue-600/5",
  animationDelay = "0ms",
  trend,
  subtitle
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (change === undefined && !trend) return null;
    
    if (trend === 'neutral' || change === 0) {
      return <Minus size={16} className="text-muted-foreground" />;
    }
    
    const isPositive = trend === 'up' || (change !== undefined && change >= 0);
    return isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />;
  };

  const getTrendColor = () => {
    if (change === undefined && !trend) return "text-muted-foreground";
    
    if (trend === 'neutral' || change === 0) return "text-muted-foreground";
    
    const isPositive = trend === 'up' || (change !== undefined && change >= 0);
    return isPositive ? "text-green-500" : "text-red-500";
  };
  
  return (
    <div 
      className="relative overflow-hidden rounded-lg border border-border bg-card p-5 gradient-border animate-scale-in"
      style={{ animationDelay }}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.08] pointer-events-none z-0", colorClass)} />
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-2xl font-semibold">{value}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
          {(change !== undefined || trend) && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              getTrendColor()
            )}>
              {getTrendIcon()}
              {change !== undefined && (
                <>
                  <span>{Math.abs(change).toFixed(1)}%</span>
                  <span className="text-muted-foreground ml-1">vs mês anterior</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="h-10 w-10 rounded-md bg-card flex items-center justify-center border border-border">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}