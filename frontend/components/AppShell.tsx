'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { logout } from '@/lib/api';
import type { CurrentUser } from '@/lib/types';

export type NavSubItem = {
  id: string;
  label: string;
  href: string;
};

export type NavGroupItem = {
  id: string;
  groupLabel: string;
  defaultOpen?: boolean;
  items: NavSubItem[];
};

export type NavigationStructure = {
  topItems: NavSubItem[];
  groups: NavGroupItem[];
};

export default function AppShell({
  me,
  title,
  subtitle,
  children,
  onNavigate,
}: {
  me: CurrentUser;
  title: string;
  subtitle: string;
  children: ReactNode;
  onNavigate?: (href: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const navStructure = useMemo(() => getAdminNavigation(me.role), [me.role]);

  // Track collapse state for navigation groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navStructure.groups.forEach((g) => {
      initial[g.id] = g.defaultOpen ?? true;
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header-row">
          <Link href="/" className="brand-lockup" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">CF</span>
            <span>
              <strong>CampusFlow</strong>
              <small>Assignment Registry</small>
            </span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="sidebar-section-label">{me.role} workspace</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navStructure.topItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => handleLinkClick(item.href)}
            >
              <span>{item.label}</span>
            </Link>
          ))}

          {navStructure.groups.map((group) => {
            const isOpen = openGroups[group.id] ?? true;
            return (
              <div key={group.id} className="sidebar-group">
                <button
                  type="button"
                  className="sidebar-group-btn"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                >
                  <span className="sidebar-group-title">
                    <span>{group.groupLabel}</span>
                  </span>
                  <span className={`sidebar-group-arrow ${isOpen ? 'open' : ''}`}>▶</span>
                </button>

                {isOpen && (
                  <div className="sidebar-subnav">
                    {group.items.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className="sidebar-sublink"
                        onClick={() => handleLinkClick(subItem.href)}
                      >
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footnote">
          <span>Role-based access</span>
          <strong>JWT + ownership checks</strong>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-heading">
            <button
              type="button"
              className="menu-button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
            <div>
              <p className="topbar-kicker">{me.role}</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          <div className="account-actions">
            <div className="account-card">
              <span className="avatar">{initials(me.fullName)}</span>
              <span>
                <strong>{me.fullName}</strong>
                <small>{me.email}</small>
              </span>
            </div>
            <button type="button" className="btn btn-quiet" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="workspace-content" id="main-content">{children}</main>
      </div>
    </div>
  );
}

function getAdminNavigation(role: CurrentUser['role']): NavigationStructure {
  if (role === 'Admin') {
    return {
      topItems: [
        { id: 'nav-overview', label: 'Overview Dashboard', href: '/admin?tab=overview' },
        { id: 'nav-portal', label: 'Main Portal', href: '/dashboard' },
      ],
      groups: [
        {
          id: 'users-group',
          groupLabel: 'Faculty & Learners',
          defaultOpen: true,
          items: [
            { id: 'add-teacher', label: 'Add Teacher', href: '/admin?tab=users#faculty-students' },
            { id: 'add-student', label: 'Add Student', href: '/admin?tab=users#faculty-students' },
            { id: 'create-account', label: 'Create Account', href: '/admin?tab=users#faculty-students' },
            { id: 'user-tables', label: 'User Datatables', href: '/admin?tab=users#tables' },
          ],
        },
        {
          id: 'academics-group',
          groupLabel: 'Academic Setup',
          defaultOpen: true,
          items: [
            { id: 'create-classroom', label: 'Create Classroom', href: '/admin?tab=academics#academics' },
            { id: 'create-subject', label: 'Create Subject', href: '/admin?tab=academics#academics' },
            { id: 'academic-tables', label: 'Academic Datatables', href: '/admin?tab=academics#tables' },
          ],
        },
        {
          id: 'allocations-group',
          groupLabel: 'Assignments & Enrollments',
          defaultOpen: true,
          items: [
            { id: 'map-teacher', label: 'Map Teacher', href: '/admin?tab=allocations#enrollments-and-mappings' },
            { id: 'enroll-student', label: 'Enroll Student', href: '/admin?tab=allocations#enrollments-and-mappings' },
            { id: 'allocation-tables', label: 'Allocation Datatables', href: '/admin?tab=allocations#tables' },
          ],
        },
        {
          id: 'audit-group',
          groupLabel: 'Security & Audit',
          defaultOpen: false,
          items: [
            { id: 'audit-logs', label: 'System Audit Logs', href: '/admin?tab=audit' },
          ],
        },
      ],
    };
  }

  if (role === 'Teacher') {
    return {
      topItems: [
        { id: 'teacher-dash', label: 'Teacher Dashboard', href: '/teacher' },
        { id: 'teacher-portal', label: 'Main Portal', href: '/dashboard' },
        { id: 'teacher-assignments', label: 'My Assignments', href: '/teacher#assignments' },
        { id: 'teacher-create', label: 'Create Assignment', href: '/teacher#create' },
        { id: 'teacher-grading', label: 'Grading Queue', href: '/teacher#grading' },
      ],
      groups: [],
    };
  }

  return {
    topItems: [
      { id: 'student-dash', label: 'Student Portal', href: '/student' },
      { id: 'student-portal', label: 'Main Portal', href: '/dashboard' },
      { id: 'student-assignments', label: 'Open Assignments', href: '/student#assignments' },
      { id: 'student-submissions', label: 'My Submissions', href: '/student#submissions' },
    ],
    groups: [],
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
