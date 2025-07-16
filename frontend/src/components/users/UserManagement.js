import React, { useState, useEffect } from 'react';
import userManagementService from '../../services/userManagementService';
import authService from '../../services/authService';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, currentUserData] = await Promise.all([
        userManagementService.getUsers(),
        authService.getCurrentUser()
      ]);
      
      setUsers(usersData);
      setCurrentUser(currentUserData);
    } catch (error) {
      setError('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleManagerStatus = async (userId) => {
    try {
      const result = await userManagementService.toggleManagerStatus(userId);
      setSuccess(result.message);
      await loadData(); // Recharger les données
    } catch (error) {
      setError('Erreur lors de la modification du statut: ' + error.message);
    }
  };

  const handleUpdatePermissions = async (userId, permissions) => {
    try {
      const result = await userManagementService.updateUserPermissions(userId, permissions);
      setSuccess(result.message);
      await loadData(); // Recharger les données
    } catch (error) {
      setError('Erreur lors de la mise à jour des permissions: ' + error.message);
    }
  };

  const canManageUsers = currentUser?.is_pharmacist || currentUser?.permissions?.can_manage_users;

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="user-management-container">
        <div className="access-denied">
          <h3>Accès Refusé</h3>
          <p>Seuls les pharmaciens peuvent gérer les utilisateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="header">
        <h2>Gestion des Utilisateurs</h2>
        {currentUser?.is_pharmacist && (
          <div className="pharmacist-badge">
            <span className="badge pharmacist">Pharmacien - Tous les droits</span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      <div className="users-list">
        <div className="users-header">
          <h3>Utilisateurs de la Pharmacie</h3>
        </div>
        
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Type</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="fullname">{user.first_name} {user.last_name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="user-types">
                      {user.is_pharmacist && <span className="badge pharmacist">Pharmacien</span>}
                      {user.is_manager && <span className="badge manager">Manager</span>}
                      {!user.is_pharmacist && !user.is_manager && <span className="badge employee">Employé</span>}
                    </div>
                  </td>
                  <td>
                    <div className="permissions">
                      {user.is_pharmacist ? (
                        <span className="all-permissions">Toutes les permissions</span>
                      ) : (
                        <div className="permissions-list">
                          {user.permissions?.can_manage_inventory && <span className="perm">Inventaire</span>}
                          {user.permissions?.can_manage_sales && <span className="perm">Ventes</span>}
                          {user.permissions?.can_manage_purchases && <span className="perm">Achats</span>}
                          {user.permissions?.can_view_reports && <span className="perm">Rapports</span>}
                          {user.permissions?.can_manage_users && <span className="perm">Utilisateurs</span>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      {!user.is_pharmacist && currentUser?.is_pharmacist && (
                        <button
                          onClick={() => handleToggleManagerStatus(user.id)}
                          className={`btn ${user.is_manager ? 'btn-warning' : 'btn-primary'}`}
                        >
                          {user.is_manager ? 'Retirer Manager' : 'Faire Manager'}
                        </button>
                      )}
                      {user.is_pharmacist && (
                        <span className="protected-user">Pharmacien protégé</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-panel">
        <h4>Informations sur les Permissions</h4>
        <ul>
          <li><strong>Pharmacien:</strong> A automatiquement tous les droits dans sa pharmacie</li>
          <li><strong>Manager:</strong> Permissions configurables par le pharmacien</li>
          <li><strong>Employé:</strong> Accès de base aux ventes uniquement</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
