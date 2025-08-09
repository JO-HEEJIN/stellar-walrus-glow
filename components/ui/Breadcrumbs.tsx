import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>&gt;</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-black transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-black">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}