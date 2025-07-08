import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';

const RecordPaymentModal = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }
    setError('');
    onSubmit({ amount: amt, payment_method: method, reference });
    setAmount('');
    setMethod('bank_transfer');
    setReference('');
    onClose();
  };

  return (
    <Modal title="Record Payment" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="credit_card">Credit Card</option>
          <option value="check">Check</option>
          <option value="other">Other</option>
        </select>

        <Input
          label="Reference"
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder="Optional reference or note"
        />

        <div className="flex justify-end space-x-2">
          <Button onClick={handleSubmit}>Submit</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecordPaymentModal;
