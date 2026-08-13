import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import FormField from '../ui/FormField';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { CurrentUser, UserResponse, UserRole } from '@/lib/types';

interface UsersTableProps {
  users: UserResponse[];
  me: CurrentUser;
  onToggleStatus: (user: UserResponse) => Promise<void>;
  onUpdateUser?: (
    id: string,
    fullName: string,
    email: string,
    role: UserRole,
    isActive: boolean,
  ) => Promise<void>;
  savingActionId: string | null;
}

export default function UsersTable({
  users,
  me,
  onToggleStatus,
  onUpdateUser,
  savingActionId,
}: UsersTableProps) {
  const [selectedUserForConfirm, setSelectedUserForConfirm] = useState<UserResponse | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Student');
  const [editIsActive, setEditIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'active'
          ? user.isActive
          : roleFilter === 'inactive'
          ? !user.isActive
          : user.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handleFilterChange(filter: string) {
    setRoleFilter(filter);
    setCurrentPage(1);
  }

  function handleActionClick(user: UserResponse) {
    if (user.isActive) {
      setSelectedUserForConfirm(user);
    } else {
      void onToggleStatus(user);
    }
  }

  function handleOpenEditModal(user: UserResponse) {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
  }

  async function handleSaveEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser || !onUpdateUser) return;
    await onUpdateUser(
      editingUser.id,
      editFullName,
      editEmail,
      editRole,
      editIsActive,
    );
    setEditingUser(null);
  }

  const roleFilterOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Students Only', value: 'student' },
    { label: 'Teachers Only', value: 'teacher' },
    { label: 'Admins Only', value: 'admin' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ];

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>System Users</h3>
          <p className="panel-subtitle">Managed student, teacher, and admin accounts.</p>
        </div>
        <span>{users.length} accounts</span>
      </div>

      {users.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search users by name or email..."
          filterOptions={roleFilterOptions}
          selectedFilter={roleFilter}
          onFilterChange={handleFilterChange}
          filterLabel="Filter users"
        />
      )}

      {users.length === 0 ? (
        <EmptyState title="No users" message="Create the first managed account above." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No matching users" message="Try clearing your search or changing filters." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="user-cell">
                        <div className={`user-avatar role-${item.role.toLowerCase()}`}>
                          {getInitials(item.fullName)}
                        </div>
                        <div>
                          <strong>{item.fullName}</strong>
                          <br />
                          <small className="muted">{item.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${item.role.toLowerCase()}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <StatusChip label={item.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td>
                      {item.id === me.id ? (
                        <span className="muted small-text">Current User</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit user details & assign role"
                          >
                            Edit
                          </button>

                          <SubmitButton
                            size="small"
                            variant={item.isActive ? 'danger-outline' : 'quiet'}
                            loading={savingActionId === `user-${item.id}`}
                            onClick={() => handleActionClick(item)}
                            type="button"
                            aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} user account ${item.fullName}`}
                          >
                            {item.isActive ? 'Deactivate' : 'Activate'}
                          </SubmitButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {selectedUserForConfirm && (
        <ConfirmModal
          isOpen={!!selectedUserForConfirm}
          onClose={() => setSelectedUserForConfirm(null)}
          onConfirm={async () => {
            const u = selectedUserForConfirm;
            setSelectedUserForConfirm(null);
            await onToggleStatus(u);
          }}
          title={`Deactivate User Account?`}
          message={`Are you sure you want to deactivate ${selectedUserForConfirm.fullName} (${selectedUserForConfirm.email})?`}
          impactDetails={[
            'Deactivated users cannot log in to CampusFlow.',
            selectedUserForConfirm.role === 'Teacher'
              ? 'Existing assignments and grading workflows for this teacher will be paused.'
              : 'Existing student submission rights will be paused.',
          ]}
          confirmText="Deactivate User"
          variant="danger"
          loading={savingActionId === `user-${selectedUserForConfirm.id}`}
        />
      )}

      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title="Edit User & Role Assignment"
          subtitle={`Update profile details and authority for ${editingUser.fullName}`}
        >
          <form className="form-stack" onSubmit={handleSaveEditUser}>
            <div className="form-grid-two-col">
              <FormField id="edit-user-fullName" label="Full Legal Name" required>
                <input
                  id="edit-user-fullName"
                  className="field-control"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="e.g. Dr. Eleanor Vance"
                  required
                />
              </FormField>

              <FormField id="edit-user-email" label="Institutional Email" required>
                <input
                  id="edit-user-email"
                  className="field-control"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. evance@university.edu"
                  required
                />
              </FormField>
            </div>

            <div className="form-grid-two-col">
              <FormField id="edit-user-role" label="System Role Assignment" required hint="Determines dashboard access & authorizations">
                <select
                  id="edit-user-role"
                  className="field-control"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="Student">Student (Submits work)</option>
                  <option value="Teacher">Teacher (Creates & grades assignments)</option>
                  <option value="Admin">Admin (Institutional Controller)</option>
                </select>
              </FormField>

              <FormField id="edit-user-status" label="Account Status" required>
                <select
                  id="edit-user-status"
                  className="field-control"
                  value={editIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active (Can log in & perform actions)</option>
                  <option value="inactive">Inactive (Account suspended)</option>
                </select>
              </FormField>
            </div>

            <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <SubmitButton
                loading={savingActionId === `update-user-${editingUser.id}`}
                loadingText="Saving User Changes..."
              >
                Save User &amp; Assign Role
              </SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </article>
  );
}
