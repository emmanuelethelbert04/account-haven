import React from 'react';

type Props = {
  sortBy: 'stock' | 'price' | null;
  sortAsc: boolean;
  onSort: (field: 'stock' | 'price') => void;
};

function SortIndicator({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return null;
  return <span className="ml-1">{asc ? '▲' : '▼'}</span>;
}

export default function MarketplaceTableHeader({ sortBy, sortAsc, onSort }: Props) {
  return (
    <thead className="bg-gray-100 text-left text-sm text-muted-foreground">
      <tr>
        <th className="px-4 py-3">Category / Product Type</th>
        {/* <th
          className="px-4 py-3 cursor-pointer"
          onClick={() => onSort('stock')}
        >
          In Stock
          <SortIndicator active={sortBy === 'stock'} asc={sortAsc} />
        </th> */}
        <th
          className="px-4 py-3 text-right cursor-pointer"
          onClick={() => onSort('price')}
        >
          Price
          <SortIndicator active={sortBy === 'price'} asc={sortAsc} />
        </th>
      </tr>
    </thead>
  );
}
