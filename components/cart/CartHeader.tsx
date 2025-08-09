'use client';

interface CartHeaderProps {
  currentStep?: number;
}

export function CartHeader({ currentStep = 1 }: CartHeaderProps) {
  const steps = [
    { number: 1, label: '장바구니' },
    { number: 2, label: '주문/결제' },
    { number: 3, label: '완료' }
  ];

  return (
    <div className="bg-white border-b-2 border-black mb-5">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">장바구니</h1>
        <div className="flex items-center gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-3">
              {index > 0 && <span className="text-gray-400">→</span>}
              <div className={`flex items-center gap-2 text-sm ${
                currentStep >= step.number ? 'text-black font-semibold' : 'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= step.number ? 'bg-black text-white' : 'bg-gray-300'
                }`}>
                  {step.number}
                </div>
                <span>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}