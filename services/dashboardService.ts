'use client'

import React from 'react'

interface Props {
  states: string[]
  managers: string[]
  selectedUf: string
  selectedManager: string
  onChangeUf: (uf: string) => void
  onChangeManager: (manager: string) => void
}

export default function DashboardFilters({
  states,
  managers,
  selectedUf,
  selectedManager,
  onChangeUf,
  onChangeManager,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem',
      }}
    >
      <div>
        <label
          htmlFor="stateFilter"
          style={{ marginRight: '0.5rem', fontWeight: 500 }}
        >
          Estado:
        </label>
        <select
          id="stateFilter"
          value={selectedUf}
          onChange={e => onChangeUf(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        >
          <option value="">Todos</option>
          {states.map(uf => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="managerFilter"
          style={{ marginRight: '0.5rem', fontWeight: 500 }}
        >
          Gestor:
        </label>
        <select
          id="managerFilter"
          value={selectedManager}
          onChange={e => onChangeManager(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        >
          <option value="">Todos</option>
          {managers.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
