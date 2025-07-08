import React from 'react';
import Button from '../UI/Button';

const SupplierDetails = ({ supplier, onClose, onEdit }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Supplier Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="text-lg font-semibold">{supplier.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
          <p className="text-lg">{supplier.contact_person || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
          <p className="text-lg">{supplier.contact_email || 'N/A'}</p>
        </div>

        {/* Contact Phone and Address */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
          <p className="text-lg">{supplier.contact_phone || 'N/A'}</p>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p className="text-lg whitespace-pre-line">
            {[supplier.address, supplier.city, supplier.state, supplier.postal_code, supplier.country]
              .filter(Boolean)
              .join(', ') || 'N/A'}
          </p>
        </div>

        {/* Licensing and Certification */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Tax ID</h3>
          <p className="text-lg">{supplier.tax_id || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">License Number</h3>
          <p className="text-lg">{supplier.license_number || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Drug License</h3>
          <p className="text-lg">{supplier.drug_license || 'N/A'}</p>
        </div>
        <div className="md:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">Certification</h3>
          <p className="text-lg">{supplier.certification || 'N/A'}</p>
        </div>

        {/* Financial Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Credit Limit</h3>
          <p className="text-lg font-semibold text-green-700">${supplier.credit_limit?.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
          <p className={`text-lg font-semibold ${supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${supplier.current_balance?.toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Discount Rate</h3>
          <p className="text-lg">{supplier.discount_rate ? `${supplier.discount_rate.toFixed(2)}%` : 'N/A'}</p>
        </div>

        {/* Terms */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Payment Terms</h3>
          <p className="text-lg">{supplier.payment_terms || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Delivery Schedule</h3>
          <p className="text-lg">{supplier.delivery_schedule || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Minimum Order</h3>
          <p className="text-lg">${supplier.minimum_order?.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button onClick={onEdit}>Edit</Button>
      </div>
    </div>
  );
};

export default SupplierDetails;
