import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { SubjectResponse } from '@/lib/types';

interface SubjectsTableProps {
  subjects: SubjectResponse[];
  onToggleStatus: (subject: SubjectResponse) => Promise<void>;
  savingActionId: string | null;
}

export default function SubjectsTable({
  subjects,
  onToggleStatus,
  savingActionId,
}: SubjectsTableProps) {
  const [selectedSubjectForConfirm, setSelectedSubjectForConfirm] = useState<SubjectResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        subject.code.toLowerCase().includes(q) ||
        subject.name.toLowerCase().includes(q) ||
        (subject.classRoomName && subject.classRoomName.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? subject.isActive
          : !subject.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [subjects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSubjects.length / pageSize) || 1;
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(start, start + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setCurrentPage(1);
  }

  function handleActionClick(subject: SubjectResponse) {
    if (subject.isActive) {
      setSelectedSubjectForConfirm(subject);
    } else {
      void onToggleStatus(subject);
    }
  }

  const statusFilterOptions = [
    { label: 'All Subjects', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ];

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>Subjects</h3>
          <p className="panel-subtitle">Curriculum topics bound to classrooms.</p>
        </div>
        <span>{subjects.length} topics</span>
      </div>

      {subjects.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search subjects by code, name, classroom..."
          filterOptions={statusFilterOptions}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
          filterLabel="Filter subjects"
        />
      )}

      {subjects.length === 0 ? (
        <EmptyState title="No subjects" message="Create the first subject above." />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState title="No matching subjects" message="Try clearing your search or changing filters." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Subject Name</th>
                  <th scope="col">Assigned Classroom</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubjects.map((item) => (
                  <tr key={item.id}>
                    <td className="code-text font-bold">{item.code}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      {item.classRoomName ? (
                        <span className="classroom-badge">
                          {item.classRoomName}
                        </span>
                      ) : (
                        <span className="muted small-text">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusChip label={item.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td>
                      <SubmitButton
                        size="small"
                        variant={item.isActive ? 'danger-outline' : 'quiet'}
                        loading={savingActionId === `subject-${item.id}`}
                        onClick={() => handleActionClick(item)}
                        type="button"
                        aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} subject ${item.name}`}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
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
            totalItems={filteredSubjects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {selectedSubjectForConfirm && (
        <ConfirmModal
          isOpen={!!selectedSubjectForConfirm}
          onClose={() => setSelectedSubjectForConfirm(null)}
          onConfirm={async () => {
            const s = selectedSubjectForConfirm;
            setSelectedSubjectForConfirm(null);
            await onToggleStatus(s);
          }}
          title={`Deactivate Subject ${selectedSubjectForConfirm.code}?`}
          message={`Are you sure you want to deactivate ${selectedSubjectForConfirm.name} (${selectedSubjectForConfirm.code})?`}
          impactDetails={[
            'Deactivating a subject prevents new teacher mappings for this course.',
            'Existing published assignments under this subject will be locked.',
          ]}
          confirmText="Deactivate Subject"
          variant="danger"
          loading={savingActionId === `subject-${selectedSubjectForConfirm.id}`}
        />
      )}
    </article>
  );
}
