import { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SlidersHorizontal, Play, Send, TrendingUp, RefreshCw, User, Check, X } from 'lucide-react';

const TIERS = [
  { id: 'free', label: 'Free', color: 'bg-neutral-100 text-neutral-700' },
  { id: 'silver', label: 'Silver', color: 'bg-slate-100 text-slate-700' },
  { id: 'gold', label: 'Gold', color: 'bg-amber-100 text-amber-700' },
  { id: 'platinum', label: 'Platinum', color: 'bg-violet-100 text-violet-700' },
];

const DistributionManager = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  // Manual Push state
  const [pushType, setPushType] = useState('all'); // 'all', 'tier', 'user'
  const [pushTier, setPushTier] = useState('silver');
  const [pushUserId, setPushUserId] = useState('');
  const [pushAllMatches, setPushAllMatches] = useState(0);
  const [pushDailyUpdates, setPushDailyUpdates] = useState(0);
  const [isPushing, setIsPushing] = useState(false);

  // Config Edits state
  const [editingPlan, setEditingPlan] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [health, setHealth] = useState({ active_users: 0, total_unlocked: 0 });

  useEffect(() => {
    loadPlans();
    loadHealth();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await adminApi.fetchSubscriptionPlans();
      setPlans(data.filter(p => p.name !== 'free')); // Exclude free from edits
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const { count: activeUsers } = await adminApi.supabase
        .from('user_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .neq('tier', 'free');
        
      const { count: totalUnlocked } = await adminApi.supabase
        .from('user_profile_pool')
        .select('*', { count: 'exact', head: true });
        
      const emptyUsersCount = await adminApi.fetchPoolHealth();
        
      setHealth({ 
        active_users: activeUsers || 0, 
        total_unlocked: totalUnlocked || 0,
        empty_users: emptyUsersCount || 0
      });
    } catch (err) {
      console.error('Failed to load health stats:', err);
    }
  };

  const handleRunDistribution = async () => {
    if (!window.confirm('This will run the daily distribution for all active premium users. Continue?')) return;
    setIsRunning(true);
    try {
      const result = await adminApi.triggerDailyDistribution();
      setLastRunResult(result);
      window.alert(`Distribution complete! ${result?.users_updated || 0} users updated.`);
      loadHealth(); // Refresh health stats
    } catch (err) {
      window.alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  };

  const handleManualPush = async () => {
    if (pushAllMatches === 0 && pushDailyUpdates === 0) {
      return window.alert('Please enter at least 1 profile to push.');
    }
    if (pushType === 'user' && !pushUserId.trim()) {
      return window.alert('Please enter a specific User ID.');
    }

    const targetVal = pushType === 'tier' ? pushTier : (pushType === 'user' ? pushUserId : null);
    
    if (!window.confirm(`Push ${pushAllMatches} All Matches and ${pushDailyUpdates} Daily Updates to ${pushType}?`)) return;

    setIsPushing(true);
    try {
      const result = await adminApi.manualPushToUsers(pushType, targetVal, pushAllMatches, pushDailyUpdates);
      window.alert(`Successfully pushed! Processed ${result.users_processed} users.`);
      setPushAllMatches(0);
      setPushDailyUpdates(0);
    } catch (err) {
      window.alert('Push Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPushing(false);
    }
  };

  const startEditing = (plan) => {
    setEditingPlan(plan.name);
    setEditValues({
      initial_recommended_profiles: plan.initial_recommended_profiles || 0,
      initial_daily_profiles: plan.initial_daily_profiles || 0,
      daily_recommended_increment: plan.daily_recommended_increment || 0,
      daily_profiles_increment: plan.daily_profiles_increment || 0,
    });
  };

  const saveEdits = async (tierName) => {
    setIsSaving(true);
    try {
      await adminApi.updateSubscriptionPlan(tierName, {
        initial_recommended_profiles: editValues.initial_recommended_profiles,
        initial_daily_profiles: editValues.initial_daily_profiles,
        daily_recommended_increment: editValues.daily_recommended_increment,
        daily_profiles_increment: editValues.daily_profiles_increment,
      });
      await loadPlans();
      setEditingPlan(null);
    } catch (err) {
      window.alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-9 w-64 bg-white rounded-xl animate-pulse" />
        <div className="h-48 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto px-4 sm:px-6 mt-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-7">
        <div>
          <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5 mb-1">
            <SlidersHorizontal size={15} /> Distribution Control
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Distribution Manager
          </h1>
          <p className="text-neutral-500 mt-1 text-sm max-w-2xl">
            Configure Initial & Daily distribution limits for premium plans, and manually push profiles instantly.
          </p>
        </div>
        <Button onClick={handleRunDistribution} isLoading={isRunning} size="lg" icon={Play}>
          Trigger Daily Distribution Job
        </Button>
      </div>

      {lastRunResult && (
        <div className="mb-6 bg-success-50 border border-success-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <RefreshCw size={16} className="text-success-600" />
          <span className="text-sm text-success-800 font-medium">
            Last run: {lastRunResult.users_updated} users updated on {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Health Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Active Premium Users</h3>
          <p className="text-2xl font-bold text-neutral-900">{health.active_users}</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Total Unlocked Profiles in Pool</h3>
          <p className="text-2xl font-bold text-primary-600">{health.total_unlocked}</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-sm border border-error-200 bg-error-50/30">
          <h3 className="text-sm font-medium text-error-600 mb-1">Active Users with 0 Profiles</h3>
          <p className="text-2xl font-bold text-error-700">{health.empty_users}</p>
          <p className="text-[10px] text-error-500 mt-1">If &gt; 0, daily cron or signup triggers may be failing.</p>
        </div>
      </div>

      {/* Initial & Daily Distribution Configuration */}
      <Card className="mb-8 overflow-hidden border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            Distribution Configuration
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Set how many profiles users receive when they upgrade (Initial) and how many are added every day (Daily).
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="pb-3 font-semibold" rowSpan="2">Premium Plan</th>
                  <th className="pb-3 font-semibold text-center border-b border-neutral-100" colSpan="2">All Matches</th>
                  <th className="pb-3 font-semibold text-center border-b border-neutral-100" colSpan="2">Daily Updates</th>
                  <th className="pb-3 font-semibold text-right" rowSpan="2">Actions</th>
                </tr>
                <tr className="text-left text-neutral-500 border-b border-neutral-200 text-xs">
                  <th className="pb-3 font-medium">Initial</th>
                  <th className="pb-3 font-medium">Daily +</th>
                  <th className="pb-3 font-medium">Initial</th>
                  <th className="pb-3 font-medium">Daily +</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {plans.map((plan) => {
                  const isEditing = editingPlan === plan.name;
                  const tierMeta = TIERS.find(t => t.id === plan.name);
                  
                  return (
                    <tr key={plan.name} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize ${tierMeta?.color || ''}`}>
                          {plan.name}
                        </span>
                      </td>
                      
                      {isEditing ? (
                        <>
                          <td className="py-4 pr-4">
                            <input type="number" min="0" value={editValues.initial_recommended_profiles} onChange={e => setEditValues({...editValues, initial_recommended_profiles: parseInt(e.target.value)||0})} className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm" />
                          </td>
                          <td className="py-4 pr-4">
                            <input type="number" min="0" value={editValues.daily_recommended_increment} onChange={e => setEditValues({...editValues, daily_recommended_increment: parseInt(e.target.value)||0})} className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm" />
                          </td>
                          <td className="py-4 pr-4">
                            <input type="number" min="0" value={editValues.initial_daily_profiles} onChange={e => setEditValues({...editValues, initial_daily_profiles: parseInt(e.target.value)||0})} className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm" />
                          </td>
                          <td className="py-4 pr-4">
                            <input type="number" min="0" value={editValues.daily_profiles_increment} onChange={e => setEditValues({...editValues, daily_profiles_increment: parseInt(e.target.value)||0})} className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm" />
                          </td>
                          <td className="py-4 text-right flex justify-end gap-2 items-center h-[72px]">
                            <button onClick={() => saveEdits(plan.name)} disabled={isSaving} className="p-1.5 bg-success-50 text-success-600 rounded-lg hover:bg-success-100"><Check size={18} /></button>
                            <button onClick={() => setEditingPlan(null)} className="p-1.5 bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100"><X size={18} /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 font-mono text-neutral-800">{plan.initial_recommended_profiles || 0}</td>
                          <td className="py-4 font-mono text-primary-600">+{plan.daily_recommended_increment || 0}</td>
                          <td className="py-4 font-mono text-neutral-800">{plan.initial_daily_profiles || 0}</td>
                          <td className="py-4 font-mono text-primary-600">+{plan.daily_profiles_increment || 0}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => startEditing(plan)} className="text-sm font-medium text-primary-600 hover:text-primary-800">Edit</button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Manual Push Configuration */}
      <Card className="overflow-hidden border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Send size={18} className="text-amber-500" />
              Manual Distribution Push
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Instantly push additional profiles to users without waiting for the scheduled job.
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Target Audience</label>
                <select 
                  value={pushType} 
                  onChange={(e) => setPushType(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                >
                  <option value="all">All Active Users</option>
                  <option value="tier">Specific Plan Tier</option>
                  <option value="user">Specific User ID</option>
                </select>
              </div>

              {pushType === 'tier' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Select Tier</label>
                  <select 
                    value={pushTier} 
                    onChange={(e) => setPushTier(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                  >
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              )}

              {pushType === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">User ID</label>
                  <input 
                    type="text" 
                    value={pushUserId}
                    onChange={(e) => setPushUserId(e.target.value)}
                    placeholder="Enter Supabase UUID..."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">All Matches Profiles</label>
                  <input 
                    type="number" 
                    min="0"
                    value={pushAllMatches}
                    onChange={(e) => setPushAllMatches(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Daily Updates Profiles</label>
                  <input 
                    type="number" 
                    min="0"
                    value={pushDailyUpdates}
                    onChange={(e) => setPushDailyUpdates(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none font-mono"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={handleManualPush} 
                  isLoading={isPushing} 
                  className="w-full justify-center" 
                  size="lg" 
                  icon={Send}
                >
                  Push Profiles Instantly
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default DistributionManager;
