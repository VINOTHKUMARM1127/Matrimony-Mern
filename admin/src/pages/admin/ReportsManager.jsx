import { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Download, FileText, Users, CreditCard, Heart, SlidersHorizontal, Loader2 } from 'lucide-react';
import apiClient from '../../api/apiClient';

const ReportsManager = () => {
  const [isExporting, setIsExporting] = useState(null);

  const downloadCSV = (filename, data) => {
    if (!data || data.length === 0) {
      alert('No records found for export.');
      return;
    }
    const headers = Object.keys(data[0]);
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = data.map(row => headers.map(h => esc(row[h])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTable = async (table, label) => {
    setIsExporting(table);
    try {
      // For generic tables not yet supported by explicit routes,
      // fallback to a generic endpoint or show an alert if not implemented.
      const data = await apiClient.get(`/admin/reports/generic/${table}`);
      if (!data) throw new Error("No data returned");
      downloadCSV(table, data);
    } catch (err) {
      alert(`Failed to export ${label}: ` + (err.message || err));
    } finally {
      setIsExporting(null);
    }
  };

  const exportUsers = async () => {
    setIsExporting('users');
    try {
      const data = await apiClient.get('/admin/reports/users');
      
      const users = data || [];

      const flattened = users.map(u => ({
        id: u.id,
        email: u.users?.email,
        phone: u.users?.phone,
        creating_for: u.users?.creating_for,
        is_verified: u.users?.is_verified,
        created_at: u.users?.created_at,
        name: u.name,
        gender: u.gender,
        date_of_birth: u.date_of_birth,
        city: u.city,
        state: u.state,
        country: u.country,
        religion: u.religion,
        caste: u.caste,
        highest_qualification: u.highest_qualification,
        occupation: u.occupation,
        is_active: u.is_active,
        profile_completion: u.profile_completion
      }));
      downloadCSV('users_detailed', flattened);
    } catch (err) {
      alert('Failed to export Users: ' + (err.message || err));
    } finally {
      setIsExporting(null);
    }
  };

  const exportPayments = async () => {
    setIsExporting('payments');
    try {
      const data = await apiClient.get('/admin/reports/payments');
      
      const flattened = data.map(p => ({
        id: p.id,
        purchased_at: p.purchased_at,
        user_name: p.profiles?.name || '',
        user_phone: p.profiles?.phone || '',
        tier: p.tier,
        amount_paid: p.amount_paid,
        tax_amount: p.tax_amount,
        final_amount: p.final_amount,
        payment_gateway: p.payment_gateway,
        gateway_transaction_id: p.gateway_transaction_id,
        payment_status: p.payment_status,
      }));
      downloadCSV('payments_detailed', flattened);
    } catch (err) {
      alert('Failed to export Payments: ' + (err.message || err));
    } finally {
      setIsExporting(null);
    }
  };

  const reports = [
    {
      id: 'users',
      title: 'Users & Profiles',
      desc: 'Export detailed user profile data, verification status, and demographics.',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: exportUsers
    },
    {
      id: 'payments',
      title: 'Payments & Revenue',
      desc: 'Export all transactions, statuses, tax details, and Razorpay references.',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: exportPayments
    },
    {
      id: 'user_memberships',
      title: 'Active Memberships',
      desc: 'Export active, queued, and expired memberships for all users.',
      icon: FileText,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      action: async () => {
        setIsExporting('user_memberships');
        try {
          const data = await apiClient.get('/admin/reports/memberships');
          if (data) downloadCSV('user_memberships', data);
        } catch(err) {
          alert('Failed to export Memberships: ' + (err.message || err));
        } finally {
          setIsExporting(null);
        }
      }
    },
    {
      id: 'distribution_logs',
      title: 'Distribution Logs',
      desc: 'Export logs of the daily and initial profile distribution engine runs.',
      icon: SlidersHorizontal,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => exportTable('distribution_logs', 'Distribution Logs')
    },
    {
      id: 'interest_transactions',
      title: 'Interests & Interactions',
      desc: 'Export logs of interests sent, accepted, rejected, and skipped.',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      action: () => exportTable('interest_transactions', 'Interests')
    }
  ];

  return (
    <div className="pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
        <div>
          <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5 mb-1">
            <Download size={15} /> Reports & Analytics
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Data Exports
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Generate CSV exports of platform data for external reporting and analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map(report => (
          <Card key={report.id} hover className="p-5 flex flex-col h-full">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.bg} ${report.color}`}>
              <report.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{report.title}</h3>
            <p className="text-sm text-neutral-500 mb-6 flex-grow">{report.desc}</p>
            <Button 
              onClick={report.action} 
              disabled={isExporting !== null}
              variant="outline" 
              className="w-full justify-center"
              icon={isExporting === report.id ? Loader2 : Download}
            >
              {isExporting === report.id ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsManager;
