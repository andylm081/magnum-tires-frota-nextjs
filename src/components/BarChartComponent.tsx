// src/app/components/BarChartComponent.js
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Formatter para o Tooltip (mostra R$ quando for moeda)
const CustomTooltip = ({ active, payload, label, dataKey }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name;
    const formattedValue = dataKey === 'valor' 
      ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value;

    return (
      <div className="custom-tooltip" style={{
          backgroundColor: 'var(--magnum-white)',
          padding: 'var(--space-3)',
          border: '1px solid var(--magnum-border-light)',
          borderRadius: 'var(--magnum-border-radius)'
      }}>
        <p className="label">{`${label}`}</p>
        <p className="intro">{`${name}: ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

export default function BarChartComponent({ data, dataKey, xAxisKey, barName }) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={40}
        >
          <YAxis 
    tick={{ fontSize: 12 }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(value) => {
        if (dataKey !== 'valor') return value;
        if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
        return `R$ ${value}`;
    }}
/>
          <Tooltip 
            cursor={{fill: 'rgba(240, 242, 245, 0.5)'}}
            content={<CustomTooltip dataKey={dataKey} active={undefined} payload={undefined} label={undefined} />}
          />
          <Legend wrapperStyle={{fontSize: "14px", paddingTop: '15px'}} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Bar dataKey={dataKey} name={barName} fill="var(--magnum-red)" background={{ fill: '#eee' }} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}