// src/components/ChartNavPills.tsx
'use client'

import React, { useState } from 'react'

export type ChartKey =
  | 'veiculosPorUnidade'
  | 'custoVeiculoPorUnidade'
  | 'custoMultaPorUnidade'

interface Props {
  active: ChartKey
  onChange: (key: ChartKey) => void
}

export default function ChartNavPills({ active, onChange }: Props) {
  const [hovered, setHovered] = useState<ChartKey | null>(null)

  const pills: { label: string; key: ChartKey }[] = [
    { label: 'Quantidade', key: 'veiculosPorUnidade' },
    { label: 'Custo (Veículos)', key: 'custoVeiculoPorUnidade' },
    { label: 'Custo (Multas)', key: 'custoMultaPorUnidade' },
  ]

  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#f2f2f2',
        borderRadius: 4,
        padding: 2,
      }}
    >
      {pills.map(({ label, key }, idx) => {
        const isActive = key === active
        const isHovered = key === hovered

        return (
          <div
            key={key}
            onClick={() => onChange(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 12px',
              marginLeft: idx === 0 ? 0 : 2,
              borderRadius: 4,
              background: isActive
                ? '#ffffff'
                : isHovered
                ? '#e0e0e0'
                : 'transparent',
              color: isActive ? '#d9252d' : '#555555',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'background-color 0.15s',
            }}
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}
