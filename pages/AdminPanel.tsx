import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Role } from '../types';
import { UserCog, Activity, Lock, Check, Rocket, Github, Globe, Server, Database, Copy } from 'lucide-react';

const SUPABASE_SQL = `
-- 1. USERS TABLE
create table if not exists users (
  "id" text primary key,
  "username" text,
  "fullName" text,
  "role" text,
  "password" text,
  "isActive" boolean default true,
  "seatIndex" int2
);

-- 2. SUBJECTS TABLE
create table if not exists subjects (
  "id" text primary key,
  "name" text,
  "code" text,
  "teacher" text
);

-- 3. ANNOUNCEMENTS TABLE
create table if not exists announcements (
  "id" text primary key,
  "title" text,
  "content" text,
  "date" text,
  "authorId" text,
  "authorName" text,
  "type" text
);

-- 4. TASKS TABLE
create table if not exists tasks (
  "id" text primary key,
  "title" text,
  "description" text,
  "subject" text,
  "deadline" text,
  "isCompleted" boolean default false,
  "createdBy" text
);

-- 5. SCHEDULE TABLE
create table if not exists schedule (
  "id" text primary key,
  "day" text,
  "time" text,
  "subject" text,
  "room" text
);

-- 6. VIDEOS TABLE
create table if not exists videos (
  "id" text primary key,
  "title" text,
  "url" text,
  "subject" text,
  "week" int2,
  "uploadedBy" text
);

-- 7. MATERIALS TABLE
create table if not exists materials (
  "id" text primary key,
  "title" text,
  "type" text,
  "url" text,
  "description" text,
  "subject" text,
  "uploadedBy" text
);

-- 8. TUTOR EVENTS TABLE
create table if not exists tutor_events (
  "id" text primary key,
  "title" text,
  "description" text,
  "date" text,
  "tutorId" text,
  "tutorName" text,
  "maxParticipants" int2,
  "participants" jsonb default '[]',
  "waitingList" jsonb default '[]'
);

-- MIGRATION: Ensure waitingList exists if table was created previously
alter table tutor_events add column if not exists "waitingList" jsonb default '[]';

-- 9. ACTIVITY LOGS
create table if not exists activity_logs (
  "id" text primary key,
  "userId" text,
  "action" text,
  "timestamp" text
);
`;

export const AdminPanel = () => {
  const { users, activityLog, updateUserRole, updateUserStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'LOGS' | 'DEPLOYMENT'>('USERS');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserCog /> Admin Panel
        </h1>
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'USERS' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'LOGS' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Activity Logs
          </button>
          <button 
            onClick={() => setActiveTab('DEPLOYMENT')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'DEPLOYMENT' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Deployment
          </button>
        </div>
      </div>

      {activeTab === 'USERS' && (
        <div className="space-y-4 animate-fade-in">
           <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full p-2 border rounded-lg max-w-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                        className="bg-gray-50 border rounded p-1 text-xs dark:bg-gray-600 dark:text-white dark:border-gray-500"
                        disabled={user.role === Role.ADMIN}
                      >
                        {Object.values(Role).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span>
                      ) : (
                         <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                       <button 
                        onClick={() => updateUserStatus(user.id, !user.isActive)}
                        className={`p-1 rounded ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={user.isActive ? "Suspend" : "Activate"}
                        disabled={user.role === Role.ADMIN}
                       >
                         {user.isActive ? <Lock size={16} /> : <Check size={16} />}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
            <Activity size={20} /> System Logs
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {activityLog.length === 0 ? <p className="text-gray-500">No logs yet.</p> : activityLog.map(log => (
              <div key={log.id} className="text-sm p-2 border-b dark:border-gray-700 last:border-0">
                <span className="text-gray-400 text-xs block">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="text-gray-800 dark:text-gray-300">{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'DEPLOYMENT' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Rocket size={32} /> Deployment Guide
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl">
              Langkah-langkah menghubungkan aplikasi ke Supabase (Database) dan Vercel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="text-green-600" /> 1. Setup Supabase
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Buka <a href="https://supabase.com" target="_blank" className="text-primary hover:underline font-bold">supabase.com</a> dan buat project baru.</li>
                <li>Setelah project jadi, buka menu <strong>SQL Editor</strong>.</li>
                <li>
                  <div className="flex items-center justify-between mb-2 mt-2">
                    <span className="text-xs font-bold uppercase text-gray-500">Paste Script Berikut:</span>
                    <button 
                      onClick={handleCopySQL} 
                      className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {copied ? <Check size={12} className="text-green-500"/> : <Copy size={12} />} 
                      {copied ? 'Copied' : 'Copy SQL'}
                    </button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-[10px] font-mono h-32 overflow-y-auto border dark:border-gray-700">
                    <pre>{SUPABASE_SQL}</pre>
                  </div>
                </li>
                <li>Klik <strong>RUN</strong> untuk membuat tabel database.</li>
              </ol>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Server className="text-purple-600" /> 2. Connect to Vercel
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Di Dashboard Supabase, buka <strong>Project Settings &gt; API</strong>.</li>
                <li>Copy <strong>Project URL</strong> dan <strong>anon / public Key</strong>.</li>
                <li>Buka Project Anda di Vercel, masuk ke <strong>Settings &gt; Environment Variables</strong>.</li>
                <li>Tambahkan 2 variabel berikut:
                   <div className="mt-2 space-y-2 font-mono text-xs">
                     <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded flex justify-between">
                       <span>VITE_SUPABASE_URL</span>
                       <span className="text-gray-400">paste_project_url_here</span>
                     </div>
                     <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded flex justify-between">
                       <span>VITE_SUPABASE_KEY</span>
                       <span className="text-gray-400">paste_anon_key_here</span>
                     </div>
                   </div>
                </li>
              </ol>
            </div>
          </div>
          
           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                <Rocket size={16} /> Deploy & Test
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Setelah Environment Variables ditambahkan, lakukan <strong>Redeploy</strong> di Vercel. 
                Saat pertama kali dibuka, aplikasi akan otomatis mengisi database kosong dengan Data Demo (Admin, Siswa, dll).
              </p>
           </div>
        </div>
      )}
    </div>
  );
};
