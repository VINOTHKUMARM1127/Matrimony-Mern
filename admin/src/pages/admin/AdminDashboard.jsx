import { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import { Users, Crown, UserCircle, TrendingUp, Sparkles, Zap, IndianRupee, Wallet } from 'lucide-react';
import Card from '../../components/common/Card';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
  });
  const [revenue, setRevenue] = useState(null);
  const [limits, setLimits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, plans] = await Promise.all([
          adminApi.fetchAllUsers(),
          adminApi.fetchSubscriptionPlans(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        let premiumCount = 0;
        let silverCount = 0;
        let goldCount = 0;
        let platinumCount = 0;
        let dailyReg = 0;

        users.forEach((u) => {
          if (u.created_at && u.created_at.startsWith(today)) {
            dailyReg++;
          }
          const activeMembership = (u.user_memberships || []).find(m => m.status === 'active' && m.tier !== 'free');
          if (activeMembership) {
            premiumCount++;
            if (activeMembership.tier === 'silver') silverCount++;
            else if (activeMembership.tier === 'gold') goldCount++;
            else if (activeMembership.tier === 'platinum') platinumCount++;
          }
        });

        setStats({
          totalUsers: users.length,
          premiumUsers: premiumCount,
          freeUsers: users.length - premiumCount,
          silverUsers: silverCount,
          goldUsers: goldCount,
          platinumUsers: platinumCount,
          dailyRegistrations: dailyReg,
        });

        if (plans && plans.length > 0) {
          setLimits(plans);
        }

        // Revenue is best-effort; don't block the dashboard if it fails.
        try {
          const rev = await adminApi.fetchRevenueStats();
          setRevenue(rev);
        } catch (e) {
          console.warn('Revenue stats unavailable:', e);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const premiumRate =
    stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0;

  const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      iconBg: 'bg-primary-100 text-primary-600',
      accent: 'from-primary-500/10',
      sub: `${stats.dailyRegistrations} joined today`,
    },
    {
      label: 'Premium Members',
      value: stats.premiumUsers.toLocaleString(),
      icon: Crown,
      iconBg: 'bg-gold-100 text-gold-600',
      accent: 'from-gold-500/10',
      sub: `S:${stats.silverUsers} | G:${stats.goldUsers} | P:${stats.platinumUsers}`,
    },
    {
      label: 'Free Members',
      value: stats.freeUsers.toLocaleString(),
      icon: UserCircle,
      iconBg: 'bg-neutral-200 text-neutral-600',
      accent: 'from-neutral-400/10',
      sub: `${premiumRate}% conversion rate`,
    },
    {
      label: 'Total Revenue',
      value: formatINR(revenue?.total_revenue),
      icon: IndianRupee,
      iconBg: 'bg-success-100 text-success-600',
      accent: 'from-success-500/10',
      sub: revenue?.today_revenue != null ? `${formatINR(revenue.today_revenue)} today` : undefined,
    },
  ];

  const tierMeta = {
    free: { label: 'Free', dot: 'bg-neutral-400', ring: 'ring-neutral-200', text: 'text-neutral-600', chip: 'bg-neutral-100 text-neutral-600' },
    silver: { label: 'Silver', dot: 'bg-slate-400', ring: 'ring-slate-200', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-700' },
    gold: { label: 'Gold', dot: 'bg-gold-500', ring: 'ring-gold-200', text: 'text-gold-700', chip: 'bg-gold-100 text-gold-700' },
    platinum: { label: 'Platinum', dot: 'bg-violet-500', ring: 'ring-violet-200', text: 'text-violet-700', chip: 'bg-violet-100 text-violet-700' },
  };

  const renderLimitCard = (plan) => {
    if (!plan) return null;
    const meta = tierMeta[plan.name] || tierMeta.free;
    const isFree = plan.name === 'free';
    return (
      <Card hover className="overflow-hidden h-full flex flex-col">
        <div className={`px-5 py-4 flex items-center justify-between border-b border-neutral-100`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot} ring-4 ${meta.ring}`} />
            <h3 className="font-bold text-neutral-900">{plan.plan_name || meta.label}</h3>
          </div>
          <span className="text-sm font-bold text-neutral-700">
            {isFree ? 'Free' : `₹${Number(plan.price_inr || 0).toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-neutral-100">
          {[
            { k: 'Contact Credits', val: plan.contact_credits },
            { k: 'Interest Credits', val: plan.interest_credits },
          ].map((m) => (
            <div key={m.k} className="px-2 py-3 text-center">
              <p className={`text-xl font-extrabold ${meta.text}`}>{m.val ?? 0}</p>
              <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{m.k}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100">
          <div className="px-2 py-3 text-center">
            <p className="text-sm font-bold text-neutral-700">
              {plan.initial_recommended_profiles ?? 0} <span className="text-neutral-400 font-normal">/</span> {plan.initial_nearby_profiles ?? 0}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Initial (All / New)</p>
          </div>
          <div className="px-2 py-3 text-center">
            <p className="text-sm font-bold text-neutral-700">
              +{plan.daily_recommended_increment ?? 0} <span className="text-neutral-400 font-normal">/</span> +{plan.daily_nearby_increment ?? 0}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Daily (All / New)</p>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100 bg-neutral-50/40">
          <div className="px-3 py-2.5 text-center">
            <p className="text-sm font-bold text-emerald-700">{plan.validity_days ?? 0} days</p>
            <p className="text-[9px] text-neutral-400 font-medium">Validity</p>
          </div>
          <div className="px-3 py-2.5 text-center">
            <p className="text-sm font-bold text-emerald-700">₹{Number(plan.price_inr || 0).toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-neutral-400 font-medium">Price</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
        <div>
          <p className="text-sm font-medium text-primary-600 flex items-center gap-1.5 mb-1">
            <Sparkles size={15} /> Overview
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            A snapshot of your platform's members and distribution settings.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-9">
        {statCards.map((s, i) => (
          <Card key={s.label} hover className="relative overflow-hidden p-5">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} to-transparent pointer-events-none`} />
            <div className="relative flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                <s.icon size={26} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-500">{s.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 mt-1 rounded-lg bg-neutral-100 animate-pulse" />
                ) : (
                  <p className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                    {s.value.toLocaleString()}
                  </p>
                )}
                {s.sub && !isLoading && (
                  <p className="text-xs font-medium text-success-600 flex items-center gap-1 mt-0.5">
                    <TrendingUp size={12} /> {s.sub}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tier limits */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">Tier Distribution &amp; Pricing</h2>
          <span className="hidden sm:inline text-xs text-neutral-400 font-medium">· single source of truth: Premium Plans</span>
        </div>
        <a href="/settings" className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
          Edit in Premium Plans →
        </a>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-neutral-200/70 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {limits && limits.map((plan) => (
            <div key={plan.name}>
              {renderLimitCard(plan)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
