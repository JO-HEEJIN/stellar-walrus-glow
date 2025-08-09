'use client';

interface CartSelectionBarProps {
  totalItems: number;
  selectedItems: number;
  allSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  onDeleteSelected: () => void;
  onDeleteOutOfStock: () => void;
}

export function CartSelectionBar({
  totalItems,
  selectedItems,
  allSelected,
  onSelectAll,
  onDeleteSelected,
  onDeleteOutOfStock
}: CartSelectionBarProps) {
  return (
    <div className="flex justify-between items-center py-4 border-b-2 border-black mb-5">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-2 border-gray-300"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
        <label className="text-sm font-semibold">
          전체선택 ({selectedItems}/{totalItems})
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDeleteSelected}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          선택삭제
        </button>
        <button
          onClick={onDeleteOutOfStock}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          품절삭제
        </button>
      </div>
    </div>
  );
}