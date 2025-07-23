import { useState, useCallback } from 'react';

export const useCurrencyInput = (initialValue: string = '') => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [numericValue, setNumericValue] = useState(initialValue);

  const formatCurrency = useCallback((value: string): string => {
    // Remove todos os caracteres não numéricos
    const numericOnly = value.replace(/\D/g, '');
    
    if (!numericOnly) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numericOnly) / 100;
    
    // Formata com vírgula decimal brasileira
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const handleChange = useCallback((value: string) => {
    const formatted = formatCurrency(value);
    setDisplayValue(formatted);
    
    // Mantém o valor numérico sem formatação para uso nos cálculos
    const numericOnly = value.replace(/\D/g, '');
    if (numericOnly) {
      const number = parseInt(numericOnly) / 100;
      setNumericValue(number.toString());
    } else {
      setNumericValue('');
    }
  }, [formatCurrency]);

  const setValue = useCallback((value: string) => {
    if (value === '') {
      setDisplayValue('');
      setNumericValue('');
      return;
    }
    
    // Se o valor já está formatado, usa direto
    if (value.includes(',')) {
      setDisplayValue(value);
      const numericOnly = value.replace(/\D/g, '');
      if (numericOnly) {
        const number = parseInt(numericOnly) / 100;
        setNumericValue(number.toString());
      }
    } else {
      // Se é um valor numérico, formata
      const number = parseFloat(value);
      if (!isNaN(number)) {
        setDisplayValue(formatCurrency((number * 100).toString()));
        setNumericValue(value);
      }
    }
  }, [formatCurrency]);

  return {
    displayValue,
    numericValue,
    handleChange,
    setValue,
  };
};