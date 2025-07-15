import OrderManagement from '@/components/orders/order-management'

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">주문 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            주문 내역을 확인하고 상태를 관리합니다.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <OrderManagement />
      </div>
    </div>
  )
}