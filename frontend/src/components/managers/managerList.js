import React from 'react';
import Button from '../UI/Button';

const ManagerList = ({ managers, onEdit, onDelete }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Username</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {managers.length > 0 ? (
            managers.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm text-gray-900">{m.manager.username}</td>
                <td className="p-3 text-sm text-gray-900">{m.manager.email}</td>
                <td className="p-3 text-sm text-gray-900">{m.manager.first_name} {m.manager.last_name}</td>
                <td className="p-3 flex justify-center space-x-2">
                  <Button size="sm" onClick={() => onEdit(m)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(m.id)}>Delete</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500 italic">
                No managers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerList;
