import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { StudentResponse } from '@/lib/types';

interface StudentsTableProps {
  students: StudentResponse[];
  onToggleStatus: (student: StudentResponse) => Promise<void>;
  savingActionId: string | null;
}

export default function StudentsTable({
  students,
  onToggleStatus,
  savingActionId,
}: StudentsTableProps) {
  const [selectedForConfirm, setSelectedForConfirm] = useState<StudentResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const activeCount = useMemo(() => students.filter((s) => s.isActive).length, [students]);
  const inactiveCount = students.length - activeCount;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? student.isActive
          : !student.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  function handleActionClick(student: StudentResponse) {
    if (student.isActive) {
      setSelectedForConfirm(student);
    } else {
      void onToggleStatus(student);
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
            <span>S1</span>
            <h3>Enrolled Learners Roster</h3>
          </div>
          <p className="card-subtext" style={{ margin: 0 }}>
            Student accounts, class enrollment status, and participation records.
          </p>
          <div className="table-header-meta">
            <span className="table-header-pill table-header-pill-active">
              {activeCount} Active Learners
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
            + Create Student
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
          { label: 'All Students', value: 'all' },
          { label: 'Active Students', value: 'active' },
          { label: 'Inactive Students', value: 'inactive' },
        ]}
        searchPlaceholder="Search student by name or email address..."
      />

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No student profiles match filter"
          message="Adjust your search terms or create a new student account above."
        />
      ) : (
        <>
          <div className="responsive-table roster-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Registered</th>
                  <th scope="col" className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="person-cell">
                        <span className="person-avatar person-avatar-student" aria-hidden="true">
                          {getInitials(s.fullName)}
                        </span>
                        <span className="person-meta">
                          <strong>{s.fullName}</strong>
                          <span className="person-email">{s.email}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="role-tag role-tag-student">Student Learner</span>
                    </td>
                    <td>
                      <StatusChip label={s.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="cell-muted">
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="cell-actions">
                      <SubmitButton
                        variant={s.isActive ? 'outline' : 'primary'}
                        loading={savingActionId === s.id}
                        loadingText="Saving..."
                        onClick={() => handleActionClick(s)}
                        className="btn-compact"
                      >
                        {s.isActive ? 'Deactivate' : 'Reactivate'}
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
            totalItems={filteredStudents.length}
          />
        </>
      )}

      {selectedForConfirm && (
        <ConfirmModal
          isOpen={!!selectedForConfirm}
          title="Deactivate Student Account"
          message={`Are you sure you want to deactivate ${selectedForConfirm.fullName}?`}
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
