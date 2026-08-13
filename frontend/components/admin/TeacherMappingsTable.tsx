import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { TeacherAssignmentResponse } from '@/lib/types';

interface TeacherMappingsTableProps {
  mappings: TeacherAssignmentResponse[];
  onDeactivate: (id: string) => Promise<void>;
  savingActionId: string | null;
}

export default function TeacherMappingsTable({
  mappings,
  onDeactivate,
  savingActionId,
}: TeacherMappingsTableProps) {
  const [selectedMappingForConfirm, setSelectedMappingForConfirm] = useState<TeacherAssignmentResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredMappings = useMemo(() => {
    return mappings.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.teacherName.toLowerCase().includes(q) ||
        item.classRoomName.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? item.isActive
          : !item.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [mappings, searchQuery, statusFilter]);

  const activeCount = mappings.filter((item) => item.isActive).length;
  const totalPages = Math.ceil(filteredMappings.length / pageSize) || 1;
  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMappings.slice(start, start + pageSize);
  }, [filteredMappings, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setCurrentPage(1);
  }

  const statusFilterOptions = [
    { label: 'All Mappings', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ];

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>Teacher Context Mappings</h3>
          <p className="panel-subtitle">Assigned Classroom + Subject teaching authorities.</p>
        </div>
        <span>{activeCount} active</span>
      </div>

      {mappings.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by teacher, classroom, or subject..."
          filterOptions={statusFilterOptions}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
          filterLabel="Filter teacher mappings"
        />
      )}

      {mappings.length === 0 ? (
        <EmptyState title="No teacher mappings" message="Assign a teacher to a class-subject combination above." />
      ) : filteredMappings.length === 0 ? (
        <EmptyState title="No matching mappings" message="Try clearing your search or changing filters." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Teacher</th>
                  <th scope="col">Classroom / Subject</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMappings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.teacherName}</strong>
                    </td>
                    <td>
                      <span className="code-text font-bold">{item.classRoomName}</span>
                      <br />
                      <small className="muted">{item.subjectName}</small>
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
                          loading={savingActionId === `deactivate-mapping-${item.id}`}
                          onClick={() => setSelectedMappingForConfirm(item)}
                          type="button"
                          aria-label={`Deactivate mapping for ${item.teacherName} in ${item.classRoomName} — ${item.subjectName}`}
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
            totalItems={filteredMappings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {selectedMappingForConfirm && (
        <ConfirmModal
          isOpen={!!selectedMappingForConfirm}
          onClose={() => setSelectedMappingForConfirm(null)}
          onConfirm={async () => {
            const m = selectedMappingForConfirm;
            setSelectedMappingForConfirm(null);
            await onDeactivate(m.id);
          }}
          title={`Deactivate Teacher Mapping?`}
          message={`Are you sure you want to deactivate ${selectedMappingForConfirm.teacherName}'s authority over ${selectedMappingForConfirm.classRoomName} — ${selectedMappingForConfirm.subjectName}?`}
          impactDetails={[
            'The teacher will no longer be able to create new assignments for this class-subject combination.',
            'Existing published assignments remain visible, and already graded submissions are preserved.',
          ]}
          confirmText="Deactivate Mapping"
          variant="danger"
          loading={savingActionId === `deactivate-mapping-${selectedMappingForConfirm.id}`}
        />
      )}
    </article>
  );
}
