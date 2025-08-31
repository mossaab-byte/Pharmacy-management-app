import React from 'react';
import { useParams } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import WorkingPurchaseForm from '../../components/purchases/WorkingPurchaseForm';

const WorkingPurchaseFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <WorkingPurchaseForm />
      </div>
    </ErrorBoundary>
  );
};

export default WorkingPurchaseFormPage;
