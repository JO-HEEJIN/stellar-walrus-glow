'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface OrderStatusData {
  status: string
  count: number
}

interface OrderStatusChartProps {
  data: OrderStatusData[]
  title?: string
}

const COLORS = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  PREPARING: '#8b5cf6',
  SHIPPED: '#10b981',
  DELIVERED: '#6b7280',
  CANCELLED: '#ef4444'
}

const STATUS_LABELS = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소'
}

export function OrderStatusChart({ data, title = '주문 상태별 현황' }: OrderStatusChartProps) {
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || '#6b7280'
  }))

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}