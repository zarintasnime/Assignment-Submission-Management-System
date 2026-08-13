import React, { useMemo, useState } from 'react';
import { formatDateTime } from '@/lib/format';
import Pagination from '../ui/Pagination';
import TableToolbar from '../ui/TableToolbar';
import { EmptyState } from '../States';
import type { AuditLogResponse } from '@/lib/types';

interface AuditLogsTableProps {
  auditLogs: AuditLogResponse[];
}

export default function AuditLogsTable({ auditLogs }: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      const q = searchQuery.toLowerCase();
      const actor = (item.actorName ?? 'System').toLowerCase();
      const action = item.action.toLowerCase();
      const entity = item.entityType.toLowerCase();
      return actor.includes(q) || action.includes(q) || entity.includes(q);
    });
  }, [auditLogs, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  return (
    <article className="panel-card table-panel">
      <div className="panel-heading-row">
        <div>
          <h3>System Audit Trail</h3>
          <p className="panel-subtitle">Traceable record of security, academic, and workflow operations.</p>
        </div>
        <span>{auditLogs.length} events</span>
      </div>

      {auditLogs.length > 0 && (
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search audit events by actor, action, entity..."
        />
      )}

      {auditLogs.length === 0 ? (
        <EmptyState title="No audit events" message="System events will appear here automatically." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState title="No matching audit events" message="Try clearing your search query." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Entity</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((item) => (
                  <tr key={item.id}>
                    <td className="code-text small-text">{formatDateTime(item.createdAt)}</td>
                    <td>
                      <strong>{item.actorName ?? 'System'}</strong>
                    </td>
                    <td>
                      <span className="audit-action-badge">{item.action}</span>
                    </td>
                    <td>
                      <small className="muted">{item.entityType}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </article>
  );
}
