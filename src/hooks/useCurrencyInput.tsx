// src/hooks/useCurrencyInput.js
'use client';

import { useState, useEffect, useCallback } from 'react';

// Função para formatar um número para o padrão BRL (ex: 1234.56 -> "1.234,56")
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  const numberValue = Number(value);
  if (isNaN(numberValue)) return '';
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const useCurrencyInput = (initialValue = null) => {
  const [displayValue, setDisplayValue] = useState('');
  const [numericValue, setNumericValue] = useState(null);

  // CORRIGIDO: Função para definir o valor de fora do hook (ex: ao carregar dados)
  const setValue = useCallback((value) => {
    if (value === null || value === undefined || value === '') {
        setDisplayValue('');
        setNumericValue(null);
    } else {
        const numberValue = Number(value);
        if (!isNaN(numberValue)) {
            setNumericValue(numberValue);
            setDisplayValue(formatCurrency(numberValue));
        }
    }
  }, []);

  useEffect(() => {
    // Define o valor inicial quando o componente é montado
    setValue(initialValue);
  }, [initialValue, setValue]);

  const handleChange = (e) => {
    let inputValue = e.target.value;
    const digitsOnly = inputValue.replace(/\D/g, '');

    if (digitsOnly === '') {
      setDisplayValue('');
      setNumericValue(null);
      return;
    }

    const numberValue = Number(digitsOnly) / 100;
    setNumericValue(numberValue);

    const formatted = formatCurrency(numberValue);
    setDisplayValue(formatted);
  };

  // CORRIGIDO: Retorna a função setValue para ser usada externamente
  return {
    displayValue,
    numericValue,
    handleChange,
    setValue,
  };
};
