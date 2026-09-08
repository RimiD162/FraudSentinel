import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Users, UserPlus, Shield, MoreVertical, CheckCircle2, Mail, Edit3, Trash2 } from 'lucide-react';

/**
 * UserManagement Page Component
 * Organizational access management, team member assignments, and role delegation.
 * Permissions: Admin (Full), Fraud Analyst (Hidden), Viewer (Hidden)
 */
export default function UserManagement() {
  const isViewOnly = useViewOnly();

  const [users, setUsers] = useState([
    {
      id: 'usr_1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@fraudsentinel.io',
      role: 'Admin',
      status: 'Active',
      lastActive: '12 mins ago',
      avatarColor: 'bg-blue-600',
    },
    {
      id: 'usr_2',
      name: 'David Kalu',
      email: 'david.k@fraudsentinel.io',
      role: 'Fraud Analyst',
      status: 'Active',
      lastActive: '1 hour ago',
      avatarColor: 'bg-emerald-600',
    },
    {
      id: 'usr_3',
      name: 'Elena Rostova',
      email: 'elena.r@fraudsentinel.io',
      role: 'Fraud Analyst',
      status: 'Active',
      lastActive: '3 hours ago',
      avatarColor: 'bg-indigo-600',
    },
    {
      id: 'usr_4',
      name: 'Marcus Sterling',
      email: 'm.sterling@advisors.com',
      role: 'Viewer',
      status: 'Active',
      lastActive: 'Yesterday',
      avatarColor: 'bg-amber-600',
    },
    {
      id: 'usr_5',
      name: 'Audrey Chen',
      email: 'a.chen@compliance-audit.org',
      role: 'Viewer',
      status: 'Invited',
      lastActive: 'Pending accept',
      avatarColor: 'bg-gray-600',
    },
  ]);

  const handleInvite = () => {
    if (isViewOnly) return;
    const email = prompt('Enter new member email address:');
    if (!email) return;
    const newUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'Fraud Analyst',
      status: 'Invited',
      lastActive: 'Just invited',
      avatarColor: 'bg-blue-600',
    };
    setUsers([...users, newUser]);
  };

  const handleRemove = (id) => {
    if (isViewOnly) return;
    if (confirm('Are you sure you want to revoke this user access?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>User Management</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Admin Only
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Manage organization team members, assign access control roles, and review session activity.
          </p>
        </div>

        {/* Action Button: Invite Member */}
        <button
          type="button"
          disabled={isViewOnly}
          onClick={handleInvite}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#0E121A]/50">
                <th className="py-3 px-5">Team Member</th>
                <th className="py-3 px-5">System Role</th>
                <th className="py-3 px-5">Account Status</th>
                <th className="py-3 px-5">Last Active</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222734] text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#1C212B] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${user.avatarColor} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 font-normal">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : user.role === 'Fraud Analyst'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        user.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-400 font-mono">
                    {user.lastActive}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => alert(`Editing permissions for ${user.name}`)}
                        className="p-1.5 rounded hover:bg-[#0B0E14] text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Permissions"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => handleRemove(user.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
