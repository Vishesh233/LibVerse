import React, { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { ConfirmModal } from '../components/ConfirmModal';
import { Avatar } from '../components/Avatar';

/**
 * "Find a student": Library ID (any case), name or email, then Enter. One match (or an exact
 * Library ID) opens Student 360; several show a short list.
 */
const FindStudent = ({ base, isAdmin }) => {
  const navigate = useNavigate();
  const inputId = useId();
  const [q, setQ] = useState('');
  const [state, setState] = useState({ loading: false, results: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    const text = q.trim();
    if (!text) return;
    setState({ loading: true, results: null, error: null });
    try {
      const res = await adminAPI.lookupUsers(text);
      const found = res.data.users || [];
      if (found.length === 1) {
        navigate(`${base}/users/${found[0]._id}`);
        return;
      }
      setState({ loading: false, results: found, error: null });
    } catch (err) {
      setState({ loading: false, results: null, error: err.response?.data?.message || 'Search failed. Please try again.' });
    }
  };

  return (
    <section className="card-glass !p-4 sm:!p-5" aria-labelledby={`${inputId}-title`}>
      <h2 id={`${inputId}-title`} className="font-display text-lg font-semibold text-slate-100">Find a {isAdmin ? 'member' : 'student'}</h2>
      <p className="mt-0.5 text-xs text-slate-400">Type a Library ID (any case), a name or an email and press Enter to open their page.</p>
      <form onSubmit={submit} className="mt-3 flex gap-2" role="search">
        <label htmlFor={inputId} className="sr-only">Library ID, name or email</label>
        <input
          id={inputId}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. LIB-1003, Asha or asha@…"
          autoComplete="off"
          spellCheck="false"
          className="input-amo min-w-0 flex-1 !text-base"
        />
        <button type="submit" disabled={state.loading || !q.trim()} className="btn-primary min-h-[44px] px-5 text-sm">
          {state.loading ? 'Finding…' : 'Find'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-rose-200" role="alert">{state.error}</p>}
      {state.results && (
        state.results.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400" role="status">Nobody matches “{q.trim()}”.</p>
        ) : (
          <div className="mt-3" role="status">
            <p className="mb-2 text-xs text-slate-400">{state.results.length} matches{state.results.length === 10 ? ' (first 10)' : ''}: pick one</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {state.results.map((u) => (
                <li key={u._id}>
                  <button type="button" onClick={() => navigate(`${base}/users/${u._id}`)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-left hover:border-indigo-400/40">
                    <Avatar name={u.name} src={u.profileImage} size={9} role={u.role} className="flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-100">{u.name}</span>
                      <span className="block truncate text-xs text-slate-400"><span className="font-mono">{u.libraryId || 'No ID'}</span>{u.role !== 'student' ? ` · ${u.role}` : ''}{u.isActive === false ? ' · inactive' : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </section>
  );
};

export const ManageUsers = () => {
  const { user: currentUser, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const base = isAdmin ? '/admin' : '/librarian';
  // Student 360: admins open anyone, librarians students only (the endpoint enforces the same rule)
  const canOpen = (u) => isAdmin || u.role === 'student';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: 'student',
    phone: '',
    address: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({
        search: searchQuery,
        role: selectedRole,
        limit: 100,
      });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedRole]);

  const visibleUsers = useMemo(() => {
    if (isLibrarian) {
      return users.filter((u) => u.role !== 'admin');
    }
    return users;
  }, [users, isLibrarian]);

  // Admins manage everyone; librarians manage student accounts only (enforced by the backend too)
  const canEditUser = (u) => isAdmin || (isLibrarian && u.role === 'student');

  // Nobody can deactivate their own account
  const canToggleStatus = (u) => u._id !== currentUser?._id && canEditUser(u);

  // Handle Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.warning('Please fill in required fields (Name, Email, Password)');
      return;
    }

    if (isLibrarian && addForm.role !== 'student') {
      toast.warning('Librarians can only create student accounts.');
      return;
    }

    try {
      const res = await adminAPI.createUser(addForm);
      toast.success(res.data?.message || 'User created successfully!');
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', role: 'student', phone: '', address: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Handle Open Edit Modal
  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      phone: u.phone || '',
      address: u.address || '',
    });
    setShowEditModal(true);
  };

  // Handle Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await adminAPI.updateUser(editingUser._id, editForm);
      toast.success(res.data?.message || 'User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Handle Toggle Active/Inactive Status with confirmation
  const handleToggleStatus = async (u) => {
    const action = u.isActive ? 'deactivate' : 'restore';
    const confirmMessage = u.isActive
      ? `Are you sure you want to deactivate ${u.name}? They will not be able to log in.`
      : `Are you sure you want to restore ${u.name}? They will be able to log in again.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await adminAPI.deleteUser(u._id);
      toast.success(res.data?.message || `User ${action}d successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  // Admin only: a new card version; the old card QR stops working at the desk
  const [reissuing, setReissuing] = useState(null);
  const [reissueBusy, setReissueBusy] = useState(false);
  const confirmReissue = async () => {
    if (!reissuing) return;
    setReissueBusy(true);
    try {
      const res = await adminAPI.reissueCard(reissuing._id);
      toast.success(res.data?.message || 'New card issued');
      setReissuing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'The card could not be reissued');
    } finally {
      setReissueBusy(false);
    }
  };

  // Format Date (e.g. 1/15/2024)
  const formatDate = (d) => {
    if (!d) return '1/15/2024';
    return new Date(d).toLocaleDateString('en-US');
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {visibleUsers.length} {isLibrarian ? 'students and librarians' : 'users'} visible
            </p>
            {isLibrarian && (
              <p className="text-xs text-emerald-500 font-medium mt-1.5">
                Viewing only other librarians and students. Librarian accounts are read-only for this portal.
              </p>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#6d5cff] to-[#8b6efb] hover:from-[#7d66ff] hover:to-[#9a79ff] text-white text-xs font-semibold rounded-2xl px-5 py-3 shadow-[0_18px_50px_rgba(110,80,255,0.24)] transition-colors cursor-pointer"
          >
            <span className="text-base font-bold">+</span> Add New User
          </button>
        </div>

        <FindStudent base={base} isAdmin={isAdmin} />

        {/* Filter and Search Bar Card */}
        <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full input-amo input-search pr-4 text-xs"
            />
          </div>

          {/* Role Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full input-amo cursor-pointer"
            >
              <option value="All Roles">All Roles</option>
              <option value="student">Student</option>
              <option value="librarian">Librarian</option>
              {isAdmin && <option value="admin">Admin</option>}
            </select>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">USER</th>
                  <th className="py-3.5 px-4">ROLE</th>
                  <th className="py-3.5 px-4">MEMBER SINCE</th>
                  <th className="py-3.5 px-4">BOOKS ISSUED</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Loading users from system...
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No users found matching filters.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((u) => {
                    const roleBadgeClass =
                      u.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : u.role === 'librarian'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-300 border border-blue-500/20';

                    const roleLabel =
                      u.role === 'admin'
                        ? 'admin'
                        : u.role === 'librarian'
                        ? 'librarian'
                        : 'student';

                    return (
                      <tr
                        key={u._id}
                        className={`hover:bg-slate-900/30 transition-colors ${canOpen(u) ? 'cursor-pointer' : ''}`}
                        onClick={(e) => {
                          // Row click opens Student 360; the action buttons in the row keep their own job
                          if (!canOpen(u) || e.target.closest('button, a, input, select')) return;
                          navigate(`${base}/users/${u._id}`);
                        }}
                      >
                        {/* USER */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {u.profileImage ? (
                                <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name?.substring(0, 2).toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              {canOpen(u) ? (
                                <button type="button" onClick={() => navigate(`${base}/users/${u._id}`)} className="text-left text-xs font-bold text-slate-100 hover:text-indigo-200 hover:underline">
                                  {u.name}
                                </button>
                              ) : (
                                <p className="font-bold text-slate-100 text-xs">{u.name}</p>
                              )}
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">ID: {u.libraryId || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${roleBadgeClass}`}>
                            {u.role === 'student' && '🎓'}
                            {u.role === 'librarian' && '📚'}
                            {u.role === 'admin' && '⚡'}
                            {roleLabel}
                          </span>
                        </td>

                        {/* MEMBER SINCE */}
                        <td className="py-4 px-4 text-slate-500">{formatDate(u.createdAt)}</td>

                        {/* BOOKS ISSUED */}
                        <td className="py-4 px-4 font-bold text-slate-100">{u.booksIssued ?? 0}</td>

                        {/* STATUS */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              u.isActive
                                  ? 'bg-emerald-900/30 text-emerald-300'
                                  : 'bg-slate-800/30 text-slate-400'
                            }`}
                          >
                            {u.isActive ? 'active' : 'inactive'}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canEditUser(u) && (
                            <button
                              onClick={() => openEdit(u)}
                              title="Edit User"
                              className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/30 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            )}
                            {isAdmin && u.libraryId && (
                            <button
                              type="button"
                              onClick={() => setReissuing(u)}
                              title="Reissue library card"
                              aria-label={`Reissue the library card of ${u.name}`}
                              className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/30 cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                              </svg>
                            </button>
                            )}
                            {canToggleStatus(u) && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.isActive ? 'Deactivate User' : 'Restore User'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 cursor-pointer'
                                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 cursor-pointer'
                              }`}
                            >
                              {u.isActive ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add New User */}
      {showAddModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-amo w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-bold text-slate-100 mb-4">👤 Add New System User</h3>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full input-amo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full input-amo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full input-amo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">User Role</label>
                {isAdmin ? (
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full input-amo cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <div className="rounded-xl border border-border bg-input p-3 text-xs text-slate-400">
                    Student
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full input-amo"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Library ID</label>
                  <input
                    type="text"
                    value={addForm.libraryId || ''}
                    onChange={(e) => setAddForm({ ...addForm, libraryId: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full input-amo"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold btn-primary cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="modal-amo w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-100 mb-4">✏️ Edit User Details</h3>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full input-amo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">User Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={!isAdmin || editingUser?._id === currentUser?._id}
                  className="w-full input-amo cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="student">Student</option>
                  {isAdmin && <option value="librarian">Librarian</option>}
                  {isAdmin && <option value="admin">Admin</option>}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full input-amo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full input-amo"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold btn-danger"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!reissuing}
        title="Reissue library card?"
        description={reissuing ? `${reissuing.name} (${reissuing.libraryId}) gets a new card. Their current card QR, printed or saved, stops working at the desk straight away. They are notified and can open the new card from their profile.` : ''}
        confirmText="Reissue card"
        onConfirm={confirmReissue}
        onCancel={() => setReissuing(null)}
        loading={reissueBusy}
      />
    </MainLayout>
  );
};
