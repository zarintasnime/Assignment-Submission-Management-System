import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { EnrollmentResponse } from '@/lib/types';

interface EnrollmentsTableProps {
  enrollments: EnrollmentResponse[];
  onDeactivate: (id: string) => Promise<void>;
  savingActionId: string | null;
}

export default function EnrollmentsTable({
  enrollments,
  onDeactivate,
  savingActionId,
}: EnrollmentsTableProps) {
  const [selectedEnrollmentForConfirm, setSelectedEnrollmentForConfirm] = useState<EnrollmentResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.studentName.toLowerCase().includes(q) ||
        item.classRoomName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? item.isActive
          : !item.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchQuery, statusFilter]);

  const activeCount = enrollments.filter((item) => item.isActive).length;
  const totalPages = Math.ceil(filteredEnrollments.length / pageSize) || 1;
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setCurrentPage(1);
  }

  const statusFilterOptions = [
    { label: 'All Enrollments', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ];

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>Student Enrollments</h3>
          <p className="panel-subtitle">Student classroom membership register.</p>
        </div>
        <span>{activeCount} active</span>
      </div>

      {enrollments.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by student or classroom name..."
          filterOptions={statusFilterOptions}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
          filterLabel="Filter enrollments"
        />
      )}

      {enrollments.length === 0 ? (
        <EmptyState title="No enrollments" message="Enroll a student to a classroom above." />
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState title="No matching enrollments" message="Try clearing your search or changing filters." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Classroom</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnrollments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.studentName}</strong>
                    </td>
                    <td>
                      <span className="code-text font-bold">{item.classRoomName}</span>
                    </td>
                    <td>
                      <StatusChip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        tone={item.isActive ? 'published' : 'closed'}
                      />
                    </td>
                    <td>
                      {item.isActive ? (
                        <SubmitButton
                          size="small"
                          variant="danger-outline"
                          loading={savingActionId === `deactivate-enrollment-${item.id}`}
                          onClick={() => setSelectedEnrollmentForConfirm(item)}
                          type="button"
                          aria-label={`Deactivate enrollment for ${item.studentName} in ${item.classRoomName}`}
                        >
                          Deactivate
                        </SubmitButton>
                      ) : (
                        <span className="muted small-text">Deactivated</span>
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
            totalItems={filteredEnrollments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {selectedEnrollmentForConfirm && (
        <ConfirmModal
          isOpen={!!selectedEnrollmentForConfirm}
          onClose={() => setSelectedEnrollmentForConfirm(null)}
          onConfirm={async () => {
            const e = selectedEnrollmentForConfirm;
            setSelectedEnrollmentForConfirm(null);
            await onDeactivate(e.id);
          }}
          title={`Deactivate Enrollment?`}
          message={`Are you sure you want to deactivate ${selectedEnrollmentForConfirm.studentName}'s enrollment in ${selectedEnrollmentForConfirm.classRoomName}?`}
          impactDetails={[
            'The student will no longer see new assignments published for this classroom.',
            'Existing submitted work and grades for this classroom remain safely recorded.',
          ]}
          confirmText="Deactivate Enrollment"
          variant="danger"
          loading={savingActionId === `deactivate-enrollment-${selectedEnrollmentForConfirm.id}`}
        />
      )}
    </article>
  );
}
