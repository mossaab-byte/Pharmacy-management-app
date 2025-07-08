import React, { useState } from 'react';
import Input from '../UI/Input';
import Checkbox from '../UI/Checkbox';
import Button from '../UI/Button';

const ManagerForm = ({ initialData = null, onSubmit }) => {
  const [form, setForm] = useState({
    username: initialData?.manager?.username || '',
    email: initialData?.manager?.email || '',
    first_name: initialData?.manager?.first_name || '',
    last_name: initialData?.manager?.last_name || '',
    password: '',
    can_modify_sales: initialData?.can_modify_sales || false,
    can_delete_sales: initialData?.can_delete_sales || false,
    can_modify_purchases: initialData?.can_modify_purchases || false,
    can_delete_purchases: initialData?.can_delete_purchases || false,
    can_view_reports: initialData?.can_view_reports ?? true,
    can_manage_inventory: initialData?.can_manage_inventory || false,
    can_manage_customers: initialData?.can_manage_customers || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      manager: {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password
      }
    };
    onSubmit(initialData ? { ...form } : payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input name="username" value={form.username} onChange={handleChange} label="Username" required />
        <Input name="email" value={form.email} onChange={handleChange} label="Email" required />
        <Input name="first_name" value={form.first_name} onChange={handleChange} label="First Name" />
        <Input name="last_name" value={form.last_name} onChange={handleChange} label="Last Name" />
        {!initialData && (
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            label="Password"
            required
            className="col-span-full"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Checkbox label="Can Modify Sales" name="can_modify_sales" checked={form.can_modify_sales} onChange={handleChange} />
        <Checkbox label="Can Delete Sales" name="can_delete_sales" checked={form.can_delete_sales} onChange={handleChange} />
        <Checkbox label="Can Modify Purchases" name="can_modify_purchases" checked={form.can_modify_purchases} onChange={handleChange} />
        <Checkbox label="Can Delete Purchases" name="can_delete_purchases" checked={form.can_delete_purchases} onChange={handleChange} />
        <Checkbox label="Can View Reports" name="can_view_reports" checked={form.can_view_reports} onChange={handleChange} />
        <Checkbox label="Can Manage Inventory" name="can_manage_inventory" checked={form.can_manage_inventory} onChange={handleChange} />
        <Checkbox label="Can Manage Customers" name="can_manage_customers" checked={form.can_manage_customers} onChange={handleChange} />
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update' : 'Create'} Manager
      </Button>
    </form>
  );
};

export default ManagerForm;
