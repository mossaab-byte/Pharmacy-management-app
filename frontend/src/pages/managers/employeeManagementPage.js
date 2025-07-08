import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import managerService from '../../services/managerService';

import ManagerForm from '../../components/Pharmacist/ManagerForm';
import ManagerList from '../../components/Pharmacist/ManagerList';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managerService.getManagers();
      setManagers(data);
    } catch (error) {
      console.error('Error fetching managers', error);
      setError('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await managerService.createManager(formData);
      await fetchManagers();
      setShowModal(false);
    } catch (error) {
      console.error('Create failed', error);
      // optionally show error notification
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setSubmitting(true);
    try {
      await managerService.updateManager(id, formData);
      await fetchManagers();
      setSelectedManager(null);
      setShowModal(false);
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this manager?')) {
      setSubmitting(true);
      try {
        await managerService.deleteManager(id);
        await fetchManagers();
      } catch (error) {
        console.error('Delete failed', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      <Button onClick={() => setShowModal(true)} disabled={submitting}>+ Add Manager</Button>
      {loading && <p>Loading managers...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ManagerList
        managers={managers}
        onEdit={(m) => {
          setSelectedManager(m);
          setShowModal(true);
        }}
        onDelete={handleDelete}
      />
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedManager(null);
        }}
      >
        <ManagerForm
          initialData={selectedManager}
          onSubmit={(data) => {
            if (selectedManager) {
              handleUpdate(selectedManager.id, data);
            } else {
              handleCreate(data);
            }
          }}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
