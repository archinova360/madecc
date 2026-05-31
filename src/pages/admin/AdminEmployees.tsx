import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Briefcase,
  TrendingUp,
  MapPin
} from 'lucide-react';

import { PermissionGate } from '../../components/admin/PermissionGate';

interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  department: string;
  joinedDate: string;
  salary: number;
  email: string;
  phone: string;
  skills: string[];
}

const mockEmployees: Employee[] = [
  { 
    id: 'GM-337', 
    name: 'Armand Belinga', 
    role: 'General Manager', 
    status: 'Active', 
    department: 'Management',
    joinedDate: '2020-04-01',
    salary: 9800,
    email: 'a.belinga@madecc.com',
    phone: '+237 677 889 912',
    skills: ['Strategic Leadership', 'Enterprise Logistics', 'Consortium Agreements', 'Budget Audit']
  },
  { 
    id: 'PEE-228', 
    name: 'Christian Tchakounté', 
    role: 'Projects Execution Engineer', 
    status: 'Active', 
    department: 'Engineering',
    joinedDate: '2021-08-12',
    salary: 7800,
    email: 'c.tchakounte@madecc.com',
    phone: '+237 699 445 566',
    skills: ['Site Operations', 'Concrete Pour Supervision', 'OSHA Safety Standards', 'Layout Precision']
  },
  { 
    id: 'ARC-119', 
    name: 'Inès Ngwanza', 
    role: 'Architect', 
    status: 'Active', 
    department: 'Design',
    joinedDate: '2022-11-20',
    salary: 7500,
    email: 'i.ngwanza@madecc.com',
    phone: '+237 655 223 344',
    skills: ['Brutalist Geometry', 'SketchUp Ultra', 'Revit BIM Systems', 'Façade Thermal Splicing']
  },
  { 
    id: '1', 
    name: 'Samuel Richards', 
    role: 'Senior Project Manager', 
    status: 'Active', 
    department: 'Management',
    joinedDate: '2021-03-15',
    salary: 8500,
    email: 'sam.r@madecc.com',
    phone: '+971 50 123 4567',
    skills: ['Budgeting', 'Risk Management', 'Agile']
  },
  { 
    id: '5', 
    name: 'Aminata Diallo', 
    role: 'Corporate Accountant', 
    status: 'Active', 
    department: 'Finance',
    joinedDate: '2024-02-10',
    salary: 6500,
    email: 'a.diallo@madecc.com',
    phone: '+237 670 112 334',
    skills: ['Taxation', 'Financial Auditing', 'Payroll']
  },
  { 
    id: '6', 
    name: 'Fabrice Mbarga', 
    role: 'Executive Secretary', 
    status: 'Active', 
    department: 'Administration',
    joinedDate: '2023-10-05',
    salary: 4500,
    email: 'f.mbarga@madecc.com',
    phone: '+237 690 556 778',
    skills: ['Archive Management', 'Scheduling', 'Public Relations']
  },
  { 
    id: '2', 
    name: 'Sarah Chen', 
    role: 'Structural Engineer', 
    status: 'Active', 
    department: 'Engineering',
    joinedDate: '2022-06-01',
    salary: 7200,
    email: 's.chen@madecc.com',
    phone: '+971 50 234 5678',
    skills: ['AutoCAD', 'Bridge Design', 'Seismic Analysis']
  },
  { 
    id: '3', 
    name: 'Marcus Thorne', 
    role: 'Site Foreman', 
    status: 'On Leave', 
    department: 'Operations',
    joinedDate: '2019-11-20',
    salary: 5800,
    email: 'm.thorne@madecc.com',
    phone: '+971 50 345 6789',
    skills: ['OSHA', 'Excavation', 'Heavy Machinery']
  },
  { 
    id: '4', 
    name: 'Elena Vasquez', 
    role: 'Architect', 
    status: 'Active', 
    department: 'Design',
    joinedDate: '2023-01-10',
    salary: 7500,
    email: 'e.vasquez@madecc.com',
    phone: '+971 50 456 7890',
    skills: ['Revit', 'Sustainable Design', 'BIM']
  }
];

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from server on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch('/api/store/employees');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setEmployees(data);
        }
      } catch (e) {
        console.warn("Human Capital sync failed, using defaults", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadEmployees();
  }, []);

  // Save to server whenever employees change
  useEffect(() => {
    if (!isInitialized) return;

    const syncEmployees = async () => {
      try {
        await fetch('/api/store/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: employees }),
        });
      } catch (e) {
        console.error("Critical Human Capital failure: sync failed", e);
      }
    };

    const timeout = setTimeout(syncEmployees, 1000);
    return () => clearTimeout(timeout);
  }, [employees, isInitialized]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Engineering',
    email: '',
    phone: '',
    salary: ''
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      role: formData.role,
      department: formData.department,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      salary: parseFloat(formData.salary),
      email: formData.email,
      phone: formData.phone,
      skills: ['New Recruit']
    };
    setEmployees([newEmployee, ...employees]);
    setIsModalOpen(false);
    setFormData({ name: '', role: '', department: 'Engineering', email: '', phone: '', salary: '' });
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic">Terminate Record?</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">This will remove the employee from the active roster and revoke all system access keys.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all border border-gray-700"
              >
                Abort
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Confirm Termination
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Workforce Records</h2>
          <p className="text-gray-400 mt-1">Manage personnel, roles, and compensation. <span className="text-orange-500 font-bold uppercase text-[10px] ml-2 tracking-widest italic">All system access keys issued by CEO</span></p>
        </div>
        <PermissionGate allowedRoles={['CEO', 'SECRETARY']}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Staff</span>
          </div>
          <p className="text-3xl font-black text-white">{employees.length + 80}</p>
          <p className="text-xs text-gray-500 mt-1 font-bold">+{employees.length - mockEmployees.length + 5} since last month</p>
        </div>
        {/* ... */}
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-600/10 text-orange-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Retention</span>
          </div>
          <p className="text-3xl font-black text-white">92%</p>
          <p className="text-xs text-gray-500 mt-1 font-bold">Excellent rating</p>
        </div>
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-600/10 text-green-500 rounded-lg">
              <MapPin size={20} />
            </div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Sites</span>
          </div>
          <p className="text-3xl font-black text-white">12</p>
          <p className="text-xs text-gray-500 mt-1 font-bold">Properly manned</p>
        </div>
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-600/10 text-purple-500 rounded-lg">
              <Plus size={20} />
            </div>
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Hiring List</span>
          </div>
          <p className="text-3xl font-black text-white">08</p>
          <p className="text-xs text-gray-500 mt-1 font-bold">Open positions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <motion.div 
            key={employee.id}
            whileHover={{ y: -5 }}
            className="group bg-black/40 border border-gray-800 p-6 rounded-3xl relative overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-600/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-3xl font-black text-orange-600 border border-gray-800 group-hover:border-orange-600/30 transition-colors">
                  {employee.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-black ${
                  employee.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{employee.name}</h3>
                    <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-widest mt-0.5">
                      <Briefcase size={12} />
                      {employee.role}
                    </div>
                  </div>
                  <PermissionGate allowedRoles={['CEO', 'SECRETARY']}>
                    <button 
                      onClick={() => setDeleteConfirmId(employee.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <Plus size={20} className="rotate-45" />
                    </button>
                  </PermissionGate>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="p-1.5 bg-gray-900 rounded-lg text-gray-500">
                      <Mail size={14} />
                    </div>
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="p-1.5 bg-gray-900 rounded-lg text-gray-500">
                      <Phone size={14} />
                    </div>
                    {employee.phone}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="p-1.5 bg-gray-900 rounded-lg text-gray-500">
                      <Calendar size={14} />
                    </div>
                    Joined {employee.joinedDate}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white font-bold italic">
                    <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500">
                      <TrendingUp size={14} />
                    </div>
                    {employee.salary.toLocaleString()} FCFA/mo
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {employee.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-900 border border-gray-800 text-[9px] font-black uppercase tracking-tighter text-gray-400 rounded group-hover:border-orange-600/30 group-hover:text-orange-500 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white uppercase italic mb-6">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Role</label>
                  <input 
                    required
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Monthly Salary (FCFA)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                <input 
                  required
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-800 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all"
                >
                  Confirm Addition
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
