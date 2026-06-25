import { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Trash2, Plus, Crown, Star, SlidersHorizontal, Tag, Sparkles, Zap, Users, TrendingUp, Wallet } from 'lucide-react';

const TIERS = [
  { id: 'free', label: 'Free', dot: 'bg-neutral-400' },
  { id: 'silver', label: 'Silver', dot: 'bg-slate-400' },
  { id: 'gold', label: 'Gold', dot: 'bg-amber-500' },
  { id: 'platinum', label: 'Platinum', dot: 'bg-violet-500' },
];

const PremiumSettings = () => {
  const [plans, setPlans] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [simCurrentTier, setSimCurrentTier] = useState('free');
  const [simTargetTier, setSimTargetTier] = useState('silver');
  const [isTriggering, setIsTriggering] = useState(false);

  const handleManualTrigger = async () => {
    if (!window.confirm('Are you sure you want to run the daily distribution manually right now?')) return;
    setIsTriggering(true);
    try {
      const res = await adminApi.triggerDailyDistribution();
      alert(`Success! Users updated: ${res?.users_updated ?? 0} (on ${res?.run_date ?? 'today'})`);
    } catch (err) {
      alert('Failed to trigger daily distribution: ' + err.message);
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await adminApi.fetchSubscriptionPlans();
      const mapped = {};
      data.forEach((plan) => {
        mapped[plan.name] = plan;
      });
      setPlans(mapped);
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (tier, field, value) => {
    setPlans((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value },
    }));
  };

  const handleFeatureChange = (tier, index, value) => {
    const newFeatures = [...(plans[tier]?.features || [])];
    newFeatures[index] = value;
    handleChange(tier, 'features', newFeatures);
  };

  const addFeature = (tier) => {
    handleChange(tier, 'features', [...(plans[tier]?.features || []), 'New Feature']);
  };

  const removeFeature = (tier, index) => {
    handleChange(tier, 'features', (plans[tier]?.features || []).filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = TIERS.map((tier) => {
        const plan = plans[tier.id];
        if (!plan) return Promise.resolve();
        return adminApi.updateSubscriptionPlan(tier.id, plan);
      });
      await Promise.all(promises);
      alert('All plans saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-64 bg-white rounded-xl animate-pulse" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-white rounded-2xl border border-neutral-200/70 animate-pulse" />
        ))}
      </div>
    );
  }

  const fieldClass =
    'w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all';
  const labelClass = 'block text-xs font-semibold text-neutral-600 mb-1.5';

  const currentPlan = plans[simCurrentTier] || {};
  const targetPlan = plans[simTargetTier] || {};

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-7">
        <div>
          <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5 mb-1">
            <SlidersHorizontal size={15} /> Configuration
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-neutral-500 mt-1 text-sm max-w-2xl">
            Configure pricing, credits, initial profile allocation, and daily distribution for each tier.
            Changes apply immediately.
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} size="lg" icon={Sparkles}>
          Save All Changes
        </Button>
      </div>

      <div className="space-y-6">
        {TIERS.map((tier) => {
          const s = plans[tier.id];
          if (!s) return null;
          const isFree = tier.id === 'free';
          return (
            <Card key={tier.id} className="overflow-hidden">
              {/* Tier header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/80 to-transparent">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${tier.dot} ring-4 ring-offset-0`} style={{ boxShadow: `0 0 0 4px ${s.color_code || '#AAA'}22` }} />
                  <h2 className="text-lg font-bold text-neutral-900">{tier.label}</h2>
                  {s.is_popular && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <Star size={11} fill="currentColor" /> BEST VALUE
                    </span>
                  )}
                </div>
                {!isFree && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-700">
                    ₹{Number(s.price_inr || 0).toLocaleString()}
                    <span className="text-xs font-medium text-neutral-400">/ {s.validity_days} days</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Row 1: Plan Details + Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                  {/* Plan Details */}
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-sm flex items-center gap-2 mb-3">
                      <Tag size={15} className="text-primary-500" /> Plan Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Plan Name (ID)</label>
                        <input type="text" value={s.name || ''} onChange={(e) => handleChange(tier.id, 'name', e.target.value)} disabled className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                      <div>
                        <label className={labelClass}>Price (₹)</label>
                        <input type="number" value={s.price_inr || 0} onChange={(e) => handleChange(tier.id, 'price_inr', parseFloat(e.target.value) || 0)} disabled={isFree} className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                      <div>
                        <label className={labelClass}>Duration (Days)</label>
                        <input type="number" value={s.validity_days || 0} onChange={(e) => handleChange(tier.id, 'validity_days', parseInt(e.target.value) || 0)} disabled={isFree} className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                      <div>
                        <label className={labelClass}>Brand Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={s.color_code || '#AAAAAA'} onChange={(e) => handleChange(tier.id, 'color_code', e.target.value)} className="h-[42px] w-12 p-1 border border-neutral-200 rounded-xl cursor-pointer bg-white" />
                          <input type="text" value={s.color_code || ''} onChange={(e) => handleChange(tier.id, 'color_code', e.target.value)} className={`${fieldClass} font-mono uppercase`} />
                        </div>
                      </div>
                    </div>
                    {!isFree && (
                      <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
                        <input type="checkbox" checked={!!s.is_popular} onChange={(e) => handleChange(tier.id, 'is_popular', e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-neutral-700">Mark as "Popular / Best Value"</span>
                      </label>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-neutral-800 text-sm">Features (App UI)</h3>
                      <button onClick={() => addFeature(tier.id)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {(s.features || []).length === 0 ? (
                      <p className="text-sm text-neutral-400 italic py-2">No features listed.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(s.features || []).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input type="text" value={feature} onChange={(e) => handleFeatureChange(tier.id, idx, e.target.value)} className={`${fieldClass} flex-1`} />
                            <button onClick={() => removeFeature(tier.id, idx)} className="p-2.5 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-xl transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-neutral-100" />

                {/* Row 2: Credits + Initial Distribution + Daily Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contact Credits (always granted) */}
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                    <h3 className="font-semibold text-neutral-800 text-sm flex items-center gap-2 mb-1">
                      <Wallet size={15} className="text-emerald-600" /> Contact Credits
                    </h3>
                    <p className="text-[11px] text-neutral-500 mb-3">Granted on every purchase</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Contact Credits</label>
                        <input type="number" value={s.contact_credits || 0} onChange={(e) => handleChange(tier.id, 'contact_credits', parseInt(e.target.value) || 0)} disabled={isFree} className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                      <div>
                        <label className={labelClass}>Interest Credits</label>
                        <input type="number" value={s.interest_credits || 0} onChange={(e) => handleChange(tier.id, 'interest_credits', parseInt(e.target.value) || 0)} disabled={isFree} className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                    </div>
                  </div>

                  {/* Initial Distribution (one-time per tier) */}
                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                    <h3 className="font-semibold text-neutral-800 text-sm flex items-center gap-2 mb-1">
                      <Users size={15} className="text-blue-600" /> Initial Distribution
                    </h3>
                    <p className="text-[11px] text-neutral-500 mb-3">One-time allocation per tier</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Recommended Profiles</label>
                        <input type="number" value={s.initial_recommended_profiles || 0} onChange={(e) => handleChange(tier.id, 'initial_recommended_profiles', parseInt(e.target.value) || 0)} className={fieldClass} />
                      </div>
                    </div>
                  </div>

                  {/* Daily Distribution (added every day by cron) */}
                  <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-4">
                    <h3 className="font-semibold text-neutral-800 text-sm flex items-center gap-2 mb-1">
                      <TrendingUp size={15} className="text-violet-600" /> Daily Distribution
                    </h3>
                    <p className="text-[11px] text-neutral-500 mb-3">Added automatically every day</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Daily Increment +</label>
                        <input type="number" value={s.daily_recommended_increment || 0} onChange={(e) => handleChange(tier.id, 'daily_recommended_increment', parseInt(e.target.value) || 0)} disabled={isFree} className={`${fieldClass} disabled:opacity-50`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Simulator & Manual Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6 border-blue-100 bg-blue-50/30">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" /> Upgrade Simulator
          </h2>
          <p className="text-sm text-neutral-600 mb-4">See exactly what a user gets when they upgrade.</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className={labelClass}>Current Tier</label>
              <select className={fieldClass} value={simCurrentTier} onChange={(e) => setSimCurrentTier(e.target.value)}>
                {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="pt-6 text-neutral-400 font-bold">→</div>
            <div className="flex-1">
              <label className={labelClass}>Target Tier</label>
              <select className={fieldClass} value={simTargetTier} onChange={(e) => setSimTargetTier(e.target.value)}>
                {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">User Receives:</h3>
            {simCurrentTier === simTargetTier ? (
              <p className="text-sm text-neutral-500 italic">Select different tiers to simulate upgrade.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-neutral-600">Recommended Profiles</span>
                  <span className="font-bold text-emerald-600">+{targetPlan.initial_recommended_profiles || 0}</span>
                </li>
                <li className="flex justify-between pt-2 border-t border-neutral-50">
                  <span className="text-neutral-600">Contact Credits</span>
                  <span className="font-bold text-emerald-600">+{targetPlan.contact_credits || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-600">Interest Credits</span>
                  <span className="font-bold text-emerald-600">+{targetPlan.interest_credits || 0}</span>
                </li>
                <li className="flex justify-between pt-2 border-t border-neutral-50">
                  <span className="text-neutral-600">Premium Validity</span>
                  <span className="font-bold text-emerald-600">+{targetPlan.validity_days || 0} Days</span>
                </li>
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-6 border-violet-100 bg-violet-50/30">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-violet-500" /> Manual Distribution Trigger
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Force the Daily Distribution engine to run immediately. This will increment the profile limits for all active premium users based on their tier's Daily Increment values.
          </p>
          <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm mb-6">
            <p className="text-xs text-neutral-500">
              Note: The distribution system already runs automatically. This button is meant for testing or emergency profile pushes. It respects the "last_distribution_date" to prevent double-charging on the same day.
            </p>
          </div>
          <Button onClick={handleManualTrigger} isLoading={isTriggering} className="w-full" variant="primary">
            Run Distribution Now
          </Button>
        </Card>
      </div>

      {/* Footer save */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} isLoading={isSaving} size="lg" icon={Sparkles}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default PremiumSettings;
