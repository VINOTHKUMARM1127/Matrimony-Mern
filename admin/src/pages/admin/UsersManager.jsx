import { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Search, Shield, ChevronRight, UserMinus, Trash2, Users as UsersIcon, Crown, X, SlidersHorizontal } from 'lucide-react';
import UserModal from './UserModal';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [deleteProgress, setDeleteProgress] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.fetchAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower)
      );
    }

    if (filterGender) {
      result = result.filter((u) => u.gender === filterGender);
    }

    if (filterTier) {
      if (filterTier === 'free') {
        result = result.filter((u) => {
          const activeMembership = (u.user_memberships || []).find(m => m.status === 'active');
          return !activeMembership || activeMembership.tier === 'free';
        });
      } else {
        result = result.filter((u) => {
          const activeMembership = (u.user_memberships || []).find(m => m.status === 'active');
          return activeMembership?.tier === filterTier;
        });
      }
    }

    if (filterStatus) {
      if (filterStatus === 'complete') {
        result = result.filter((u) => u.profile_completion > 50);
      } else if (filterStatus === 'incomplete') {
        result = result.filter((u) => !u.profile_completion || u.profile_completion <= 50);
      }
    }

    setFilteredUsers(result);
  }, [searchTerm, filterGender, filterTier, filterStatus, users]);

  const handleUpdatePlan = async (userId, planType) => {
    if (!window.confirm(`Update plan to ${planType} for this user?`)) return;
    setActionLoading(true);
    try {
      await adminApi.updateUserPlan(userId, planType);
      alert('Plan updated successfully!');
      loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanUpIncomplete = async () => {
    if (!window.confirm('Are you sure you want to delete ALL users who have not completed their profile setup? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const deletedCount = await adminApi.deleteIncompleteUsers();
      alert(`Successfully deleted ${deletedCount} incomplete account(s).`);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to clean up accounts');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (id) => {
    const newSet = new Set(selectedUserIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUserIds.size} user(s)? This cannot be undone.`)) return;

    setActionLoading(true);
    setDeleteProgress({ current: 0, total: selectedUserIds.size });
    try {
      let deletedCount = 0;
      for (const userId of selectedUserIds) {
        await adminApi.deleteUser(userId);
        deletedCount++;
        setDeleteProgress({ current: deletedCount, total: selectedUserIds.size });
      }
      alert(`Successfully deleted ${deletedCount} user(s).`);
      setSelectedUserIds(new Set());
      loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete some users');
    } finally {
      setActionLoading(false);
      setDeleteProgress(null);
    }
  };

  const hasFilters = searchTerm || filterGender || filterTier || filterStatus;
  const clearFilters = () => {
    setSearchTerm('');
    setFilterGender('');
    setFilterTier('');
    setFilterStatus('');
  };

  const tierChip = (u) => {
    const activeMembership = (u.user_memberships || []).find(m => m.status === 'active');
    const tier = activeMembership?.tier || 'free';
    if (tier !== 'free') {
      const map = {
        silver: 'bg-slate-100 text-slate-700 ring-slate-200',
        gold: 'bg-gold-100 text-gold-700 ring-gold-200',
        platinum: 'bg-violet-100 text-violet-700 ring-violet-200',
      };
      const cls = map[tier] || 'bg-gold-100 text-gold-700 ring-gold-200';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ring-1 ${cls}`}>
          <Crown size={12} /> {tier}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200 capitalize">
        Free
      </span>
    );
  };

  const avatarFor = (u) => {
    const photo = u.profile_photos?.find((p) => p.is_primary) || u.profile_photos?.[0];
    if (photo?.photo_url) {
      return <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />;
    }
    return (
      <span className="text-sm font-bold text-primary-600">
        {(u.name || '?').charAt(0).toUpperCase()}
      </span>
    );
  };

  const selectClass =
    'px-3 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all cursor-pointer';

  return (
    <div className="flex flex-col">
      {!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && (
        <div className="bg-error-50 border border-error-200 text-error-800 p-4 rounded-2xl mb-6 shadow-sm">
          <p className="flex items-center gap-2 mb-1 font-bold">
            <Shield className="text-error-500" size={18} />
            Missing Service Role Key
          </p>
          <p className="text-error-700 text-sm">
            Add <code className="bg-error-100 px-1.5 py-0.5 rounded text-error-800 font-mono text-xs">VITE_SUPABASE_SERVICE_ROLE_KEY</code> to your{' '}
            <code className="font-mono text-xs">admin/.env</code> file. Without it, the panel cannot fetch emails, reset passwords, or delete users. Restart the dev server after adding it.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            Manage Users
            {!isLoading && (
              <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full ring-1 ring-primary-100">
                {users.length.toLocaleString()}
              </span>
            )}
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">View, edit, and manage every member account.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleCleanUpIncomplete}
          isLoading={actionLoading && !deleteProgress}
          icon={UserMinus}
          className="text-error-600 hover:bg-error-50 border-error-200 hover:border-error-300"
        >
          Clean Up Incomplete
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all text-sm"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400">
            <SlidersHorizontal size={16} />
          </div>

          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className={selectClass}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className={selectClass}>
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="">All Profiles</option>
            <option value="complete">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 font-medium px-2 transition-colors"
            >
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </Card>

      {/* Bulk action bar */}
      {selectedUserIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 bg-primary-50 border border-primary-100 rounded-2xl px-5 py-3 mb-4 animate-fade-in">
          <p className="text-sm font-semibold text-primary-800">
            {selectedUserIds.size} user{selectedUserIds.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedUserIds(new Set())} className="text-sm font-medium text-neutral-500 hover:text-neutral-700">
              Deselect all
            </button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete} isLoading={!!deleteProgress} icon={Trash2}>
              {deleteProgress ? `Deleting ${deleteProgress.current}/${deleteProgress.total}` : `Delete Selected`}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-11 h-11 rounded-full bg-neutral-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  <th className="px-6 py-3.5 w-12">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Profile</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`group transition-colors cursor-pointer ${selectedUserIds.has(u.id) ? 'bg-primary-50/60' : 'hover:bg-neutral-50'}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-6 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(u.id)}
                        onChange={() => handleSelectUser(u.id)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-primary-50 ring-1 ring-neutral-200 flex items-center justify-center shrink-0">
                          {avatarFor(u)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                            {u.name || 'No Name'}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">{u.email || '—'}</p>
                          {u.phone && <p className="text-xs text-neutral-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm text-neutral-600">{u.gender || '—'}</td>
                    <td className="px-6 py-4">{tierChip(u)}</td>
                    <td className="px-6 py-4">
                      {u.profile_completion > 50 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-success-500" /> {u.profile_completion}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /> {u.profile_completion || 0}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-600 focus:outline-none focus:border-primary-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) handleUpdatePlan(u.id, e.target.value);
                            e.target.value = '';
                          }}
                          disabled={actionLoading}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Change Plan…
                          </option>
                          <option value="free">Free / Demote</option>
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                        </select>
                        <ChevronRight className="text-neutral-300 group-hover:text-primary-500 transition-colors" size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-neutral-400">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                          <UsersIcon size={26} />
                        </div>
                        <p className="font-medium text-neutral-500">No users found</p>
                        {hasFilters && (
                          <button onClick={clearFilters} className="text-sm text-primary-600 font-medium hover:underline">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} onRefresh={loadUsers} />}
    </div>
  );
};

export default UsersManager;
