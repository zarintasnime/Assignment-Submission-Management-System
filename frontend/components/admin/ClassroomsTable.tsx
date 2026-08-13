import React, { useMemo, useState } from 'react';
import StatusChip from '../StatusChip';
import SubmitButton from '../SubmitButton';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { ClassRoomResponse } from '@/lib/types';

interface ClassroomsTableProps {
  rooms: ClassRoomResponse[];
  onToggleStatus: (room: ClassRoomResponse) => Promise<void>;
  savingActionId: string | null;
}

export default function ClassroomsTable({
  rooms,
  onToggleStatus,
  savingActionId,
}: ClassroomsTableProps) {
  const [selectedRoomForConfirm, setSelectedRoomForConfirm] = useState<ClassRoomResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        room.code.toLowerCase().includes(q) ||
        room.name.toLowerCase().includes(q) ||
        (room.academicYear && room.academicYear.toLowerCase().includes(q)) ||
        (room.section && room.section.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? room.isActive
          : !room.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredRooms.length / pageSize) || 1;
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRooms.slice(start, start + pageSize);
  }, [filteredRooms, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    setCurrentPage(1);
  }

  function handleActionClick(room: ClassRoomResponse) {
    if (room.isActive) {
      setSelectedRoomForConfirm(room);
    } else {
      void onToggleStatus(room);
    }
  }

  const statusFilterOptions = [
    { label: 'All Classrooms', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' },
  ];

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>Classrooms</h3>
          <p className="panel-subtitle">Academic cohorts and program groups.</p>
        </div>
        <span>{rooms.length} cohorts</span>
      </div>

      {rooms.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search classrooms by code, name, year..."
          filterOptions={statusFilterOptions}
          selectedFilter={statusFilter}
          onFilterChange={handleFilterChange}
          filterLabel="Filter classrooms"
        />
      )}

      {rooms.length === 0 ? (
        <EmptyState title="No classrooms" message="Create an academic classroom above." />
      ) : filteredRooms.length === 0 ? (
        <EmptyState title="No matching classrooms" message="Try clearing your search or changing filters." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Classroom Name</th>
                  <th scope="col">Year / Section</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.map((item) => (
                  <tr key={item.id}>
                    <td className="code-text font-bold">{item.code}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <small className="muted">
                        {item.academicYear || 'N/A'} {item.section ? `• ${item.section}` : ''}
                      </small>
                    </td>
                    <td>
                      <StatusChip label={item.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td>
                      <SubmitButton
                        size="small"
                        variant={item.isActive ? 'danger-outline' : 'quiet'}
                        loading={savingActionId === `room-${item.id}`}
                        onClick={() => handleActionClick(item)}
                        type="button"
                        aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} classroom ${item.name}`}
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
            totalItems={filteredRooms.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {selectedRoomForConfirm && (
        <ConfirmModal
          isOpen={!!selectedRoomForConfirm}
          onClose={() => setSelectedRoomForConfirm(null)}
          onConfirm={async () => {
            const r = selectedRoomForConfirm;
            setSelectedRoomForConfirm(null);
            await onToggleStatus(r);
          }}
          title={`Deactivate Classroom ${selectedRoomForConfirm.code}?`}
          message={`Are you sure you want to deactivate ${selectedRoomForConfirm.name} (${selectedRoomForConfirm.code})?`}
          impactDetails={[
            'Deactivating a classroom prevents teachers from creating new assignments for it.',
            'Student enrollments and teacher mappings linked to this classroom will become inactive.',
            'Subjects assigned to this classroom will not accept new teacher mappings.',
          ]}
          confirmText="Deactivate Classroom"
          variant="danger"
          loading={savingActionId === `room-${selectedRoomForConfirm.id}`}
        />
      )}
    </article>
  );
}
