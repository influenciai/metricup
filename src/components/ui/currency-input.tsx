import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCurrencyInput } from "@/hooks/useCurrencyInput"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    const { displayValue, numericValue, handleChange, setValue } = useCurrencyInput();
    const prevValueRef = React.useRef(value);

    // Sincroniza o valor inicial e mudanças externas apenas quando realmente mudou
    React.useEffect(() => {
      if (value !== prevValueRef.current) {
        setValue(value);
        prevValueRef.current = value;
      }
    }, [value, setValue]);

    // Notifica mudanças para o componente pai apenas quando necessário
    React.useEffect(() => {
      if (onChange && numericValue !== value && numericValue !== prevValueRef.current) {
        onChange(numericValue);
      }
    }, [numericValue, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e.target.value);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        className={cn("text-right", className)}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }