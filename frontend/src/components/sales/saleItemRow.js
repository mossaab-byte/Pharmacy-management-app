import React from 'react';
import { Select, Input, Button } from '../UI';

const SaleItemRow = ({ index, item, medicines, onChange, onRemove }) => {
  const change = (field, value) => onChange(index, field, value);

  return (
    <div className="flex gap-3 mb-3 items-center">
      <Select
        value={item.medicine}
        onChange={e => change('medicine', e.target.value)}
        className="flex-1"
        aria-label="Select medicine"
      >
        <option value="">Select Medicine</option>
        {medicines.map(m => (
          <option key={m.id} value={m.id}>
            {m.name} - ${m.unit_price.toFixed(2)}
          </option>
        ))}
      </Select>

      <Input
        type="number"
        value={item.quantity}
        onChange={e => change('quantity', +e.target.value)}
        min="1"
        className="w-20"
        aria-label="Quantity"
      />

      <Button
        variant="danger"
        size="sm"
        onClick={() => onRemove(index)}
        aria-label={`Remove item ${index + 1}`}
      >
        Remove
      </Button>
    </div>
  );
};

export default SaleItemRow;
