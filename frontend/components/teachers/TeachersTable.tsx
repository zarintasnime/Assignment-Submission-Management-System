import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { TeacherResponse } from '@/lib/types';

interface TeachersTableProps {
  teachers: TeacherResponse[];
  onToggleStatus: (teacher: TeacherResponse) => Promise<void>;
  savingActionId: string | null;
}

export default function TeachersTable({
  teachers,
  onToggleStatus,
  savingActionId,
}: TeachersTableProps) {
  const [selectedForConfirm, setSelectedForConfirm] = useState<TeacherResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const activeCount = useMemo(() => teachers.filter((t) => t.isActive).length, [teachers]);
  const inactiveCount = teachers.length - activeCount;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? teacher.isActive
          : !teacher.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  function handleActionClick(teacher: TeacherResponse) {
    if (teacher.isActive) {
      setSelectedForConfirm(teacher);
    } else {
      void onToggleStatus(teacher);
    }
  }

  function scrollToCreateForm() {
    const el = document.getElementById('faculty-students');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <article className="panel-card roster-panel">
      <div className="table-card-header">
        <div className="table-header-title-group">
          <div className="panel-card-heading">
            <span>T1</span>
            <h3>Faculty &amp; Teachers Register</h3>
          </div>
          <p className="card-subtext" style={{ margin: 0 }}>
            Manage academic instructors, status, and course authorities.
          </p>
          <div className="table-header-meta">
            <span className="table-header-pill table-header-pill-active">
              {activeCount} Active
            </span>
            {inactiveCount > 0 && (
              <span className="table-header-pill">
                {inactiveCount} Inactive
              </span>
            )}
          </div>
        </div>

        <div className="table-header-actions">
          <button
            type="button"
            onClick={scrollToCreateForm}
            className="btn btn-primary"
          >
            + Register Teacher
          </button>
        </div>
      </div>

      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedFilter={statusFilter}
        onFilterChange={(f) => {
          setStatusFilter(f);
          setCurrentPage(1);
        }}
        filterOptions={[
          { label: 'All Teachers', value: 'all' },
          { label: 'Active Faculty', value: 'active' },
          { label: 'Inactive Faculty', value: 'inactive' },
        ]}
        searchPlaceholder="Search teacher by name or institutional email..."
      />

      {filteredTeachers.length === 0 ? (
        <EmptyState
          title="No faculty members match filter"
          message="Try adjusting your search criteria or register a new teacher."
        />
      ) : (
        <>
          <div className="responsive-table roster-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Faculty Member</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                  <th scope="col" className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="person-cell">
                        <span className="person-avatar person-avatar-teacher" aria-hidden="true">
                          {getInitials(t.fullName)}
                        </span>
                        <span className="person-meta">
                          <strong>{t.fullName}</strong>
                          <span className="person-email">{t.email}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="role-tag role-tag-teacher">Teacher</span>
                    </td>
                    <td>
                      <StatusChip label={t.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="cell-muted">
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="cell-actions">
                      <SubmitButton
                        variant={t.isActive ? 'outline' : 'primary'}
                        loading={savingActionId === t.id}
                        loadingText="Saving..."
                        onClick={() => handleActionClick(t)}
                        className="btn-compact"
                      >
                        {t.isActive ? 'Deactivate' : 'Reactivate'}
                      </SubmitButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={filteredTeachers.length}
          />
        </>
      )}

      {selectedForConfirm && (
        <ConfirmModal
          isOpen={!!selectedForConfirm}
          title="Deactivate Teacher Account"
          message={`Are you sure you want to deactivate ${selectedForConfirm.fullName}? Deactivated teachers will not be able to log in.`}
          confirmText="Deactivate Account"
          onConfirm={async () => {
            const target = selectedForConfirm;
            setSelectedForConfirm(null);
            await onToggleStatus(target);
          }}
          onClose={() => setSelectedForConfirm(null)}
          loading={savingActionId === selectedForConfirm.id}
        />
      )}
    </article>
  );
}
