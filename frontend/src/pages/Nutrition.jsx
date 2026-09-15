import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getNutritionNeeds, getNutritionHistory } from "../api/nutritionApi";

const Nutrition = () => {
  const [today, setToday] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadToday = async () => {
    try {
      setError("");
      const result = await getNutritionNeeds();
      setToday(result);
    } catch (err) {
      console.error("Nutrition error:", err);
      setError(err.response?.data?.message || "Unable to load nutrition data.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (range = days) => {
    try {
      setHistoryLoading(true);
      const result = await getNutritionHistory(range);
      setHistoryData(result);
    } catch (err) {
      console.error("Nutrition history error:", err);
      setError(err.response?.data?.message || "Unable to load nutrition history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
    loadHistory(7);
  }, []);

  useEffect(() => {
    if (!loading) loadHistory(days);
  }, [days]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await Promise.all([loadToday(), loadHistory(days)]);
    setRefreshing(false);
  };

  const targets = today?.targets || today?.nutritionNeeds || {};
  const consumed = today?.consumed || {};
  const remaining = today?.remaining || {};
  const budget = today?.budget || {};
  const history = historyData?.history || [];
  const summary = historyData?.summary || {};

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const dailyBudget = Number(budget.daily ?? user.dailyBudget ?? 0);
  const spent = Number(budget.spent || 0);

  const metrics = [
    {
      key: "calories",
      label: "Calories",
      icon: "🔥",
      unit: "kcal",
      value: Number(consumed.calories || 0),
      target: Number(targets.calories || 0),
      remaining: Number(remaining.calories || 0),
      tone: "orange",
    },
    {
      key: "protein",
      label: "Protein",
      icon: "💪",
      unit: "g",
      value: Number(consumed.protein || 0),
      target: Number(targets.protein || 0),
      remaining: Number(remaining.protein || 0),
      tone: "blue",
    },
    {
      key: "carbohydrates",
      label: "Carbohydrates",
      icon: "🌾",
      unit: "g",
      value: Number(consumed.carbohydrates || 0),
      target: Number(targets.carbohydrates || 0),
      remaining: Number(remaining.carbohydrates || 0),
      tone: "yellow",
    },
    {
      key: "fat",
      label: "Fat",
      icon: "🥑",
      unit: "g",
      value: Number(consumed.fat || 0),
      target: Number(targets.fat || 0),
      remaining: Number(remaining.fat || 0),
      tone: "purple",
    },
    {
      key: "fiber",
      label: "Fiber",
      icon: "🥬",
      unit: "g",
      value: Number(consumed.fiber || 0),
      target: Number(targets.fiber || 0),
      remaining: Number(remaining.fiber || 0),
      tone: "green",
    },
  ];

  const calorieTarget = Number(targets.calories || 0);
  const proteinTarget = Number(targets.protein || 0);
  const calorieValue = Number(consumed.calories || 0);
  const proteinValue = Number(consumed.protein || 0);

  const calorieProgress = percent(calorieValue, calorieTarget);
  const proteinProgress = percent(proteinValue, proteinTarget);
  const budgetProgress = percent(spent, dailyBudget);

  const maxCalories = Math.max(
    calorieTarget,
    ...history.map((item) => Number(item.calories || 0)),
    1
  );
  const maxProtein = Math.max(
    proteinTarget,
    ...history.map((item) => Number(item.protein || 0)),
    1
  );
  const maxSpent = Math.max(
    dailyBudget,
    ...history.map((item) => Number(item.spent || 0)),
    1
  );

  const insight = useMemo(() => {
    if (proteinTarget > 0 && proteinValue < proteinTarget * 0.65) {
      return `You still need around ${Math.max(0, Math.round(proteinTarget - proteinValue))}g of protein. A high-protein recommendation would be a smart next choice.`;
    }
    if (calorieTarget > 0 && calorieValue > calorieTarget) {
      return "You have crossed your calorie target today. Keep your next choices light and balanced.";
    }
    if (dailyBudget > 0 && spent > dailyBudget) {
      return "You have crossed today's food budget. Consider lower-cost options for your next meal.";
    }
    return "You're doing well. Keep choosing meals that fit your remaining nutrition and budget.";
  }, [proteinTarget, proteinValue, calorieTarget, calorieValue, dailyBudget, spent]);

  if (loading) {
    return (
      <AppLayout>
        <NutritionSkeleton />
      </AppLayout>
    );
  }

  if (error && !today) {
    return (
      <AppLayout>
        <div className="flex min-h-[65vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">⚠️</div>
            <h2 className="mt-5 text-xl font-black text-slate-900">Nutrition unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
            <button onClick={loadToday} className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700">
              Try again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute -bottom-40 right-16 h-96 w-96 rounded-full border border-white/10 bg-white/5" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur">
                <span>✦</span> Nutrition Center
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your nutrition, all in one place.</h1>
              <p className="mt-3 text-sm leading-6 text-green-50/90 sm:text-base">
                Track your daily targets, see your nutrition trends and understand how your food choices affect your goals.
              </p>
            </div>

            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-50 disabled:opacity-70"
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">Today</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Daily nutrition targets</h2>
              <p className="mt-1 text-sm text-slate-500">Your personalized targets based on your FoodFit profile.</p>
            </div>
            <Link to="/discover" className="text-sm font-bold text-green-600 hover:text-green-700">Find food →</Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.key} {...metric} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">Daily progress</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">How you're doing today</h2>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Goal</p>
                <p className="mt-0.5 text-sm font-black text-green-700">{user.goal || "Maintain"}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <ProgressRow label="Calories" icon="🔥" value={calorieValue} target={calorieTarget} unit="kcal" progress={calorieProgress} />
              <ProgressRow label="Protein" icon="💪" value={proteinValue} target={proteinTarget} unit="g" progress={proteinProgress} />
              <ProgressRow label="Food budget" icon="₹" value={spent} target={dailyBudget} unit="₹" progress={budgetProgress} />
              <ProgressRow label="Fiber" icon="🥬" value={Number(consumed.fiber || 0)} target={Number(targets.fiber || 0)} unit="g" progress={percent(Number(consumed.fiber || 0), Number(targets.fiber || 0))} />
            </div>
          </div>

          <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">🎯</div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">FoodFit insight</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Your next best move</h2>
            <p className="mt-3 text-sm leading-6 text-green-800/75">{insight}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoBox label="Calories left" value={`${Math.round(Math.max(0, Number(remaining.calories || 0)))} kcal`} />
              <InfoBox label="Protein left" value={`${Math.round(Math.max(0, Number(remaining.protein || 0)))}g`} />
              <InfoBox label="Budget left" value={`₹${Math.round(Math.max(0, Number(budget.remaining ?? dailyBudget - spent)))}`} />
              <InfoBox label="BMR" value={`${Math.round(Number(targets.bmr || today?.nutritionNeeds?.bmr || 0))} kcal`} />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">Analytics</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Nutrition trends</h2>
              <p className="mt-1 text-sm text-slate-500">Compare your intake and spending across previous days.</p>
            </div>
            <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[7, 14, 30].map((value) => (
                <button key={value} onClick={() => setDays(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${days === value ? "bg-green-600 text-white" : "text-slate-500 hover:text-green-700"}`}>
                  {value}D
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart title="Calories" subtitle="Daily calorie intake" data={history} field="calories" target={calorieTarget} max={maxCalories} unit="kcal" loading={historyLoading} tone="orange" />
            <BarChart title="Protein" subtitle="Daily protein intake" data={history} field="protein" target={proteinTarget} max={maxProtein} unit="g" loading={historyLoading} tone="blue" />
          </div>

          <div className="mt-6">
            <BarChart title="Food spending" subtitle="Daily food spending" data={history} field="spent" target={dailyBudget} max={maxSpent} unit="₹" loading={historyLoading} tone="green" />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">History</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Nutrition history</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SummaryBox label="Avg kcal" value={Math.round(summary.averageCalories || 0)} />
              <SummaryBox label="Avg protein" value={`${Math.round(summary.averageProtein || 0)}g`} />
              <SummaryBox label="Spent" value={`₹${Math.round(summary.totalSpent || 0)}`} />
            </div>
          </div>

          {historyLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">🥗</div>
              <h3 className="mt-3 font-black text-slate-800">No nutrition history yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">Your delivered food orders will appear here after their nutrition is logged.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Spent'].map((heading) => <th key={heading} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{heading}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((day) => <HistoryRow key={day.date} day={day} />)}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {history.map((day) => <HistoryMobileCard key={day.date} day={day} />)}
              </div>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

const percent = (value, target) => target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;

const MetricCard = ({ icon, label, value, target, remaining, unit, tone }) => {
  const progress = percent(value, target);
  const tones = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };
  const bars = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${tones[tone]}`}>{icon}</div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">{progress}%</span>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{Math.round(value)}<span className="ml-1 text-xs font-medium text-slate-400">{unit}</span></p>
      <p className="mt-1 text-xs text-slate-400">of {Math.round(target)} {unit}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-700 ${bars[tone]}`} style={{ width: `${progress}%` }} /></div>
      <p className="mt-2 text-[11px] text-slate-400">{Math.round(Math.max(0, remaining))} {unit} remaining</p>
    </div>
  );
};

const ProgressRow = ({ label, icon, value, target, unit, progress }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2"><span>{icon}</span><span className="text-sm font-bold text-slate-700">{label}</span></div>
      <span className="text-xs font-black text-green-600">{progress}%</span>
    </div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${progress}%` }} /></div>
    <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{Math.round(value)} {unit}</span><span>{Math.round(target)} {unit}</span></div>
  </div>
);

const InfoBox = ({ label, value }) => <div className="rounded-2xl border border-green-100 bg-white/80 p-3"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-slate-800">{value}</p></div>;

const SummaryBox = ({ label, value }) => <div className="min-w-[76px] rounded-xl bg-green-50 px-3 py-2"><p className="text-[9px] font-semibold text-slate-400">{label}</p><p className="mt-0.5 text-sm font-black text-green-700">{value}</p></div>;

const BarChart = ({ title, subtitle, data, field, target, max, unit, loading, tone }) => {
  const barClass = tone === "orange" ? "bg-orange-400 hover:bg-orange-500" : tone === "blue" ? "bg-blue-400 hover:bg-blue-500" : "bg-green-400 hover:bg-green-500";
  const targetClass = tone === "orange" ? "border-orange-300" : tone === "blue" ? "border-blue-300" : "border-green-300";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-black text-slate-900">{title}</h3><p className="mt-1 text-xs text-slate-400">{subtitle}</p></div>
        <span className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">Target: {Math.round(target)} {unit}</span>
      </div>

      {loading ? <div className="flex h-64 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" /></div> : data.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-400">No data yet</div> : (
        <div className="mt-7 flex h-64 items-end gap-2 overflow-x-auto pb-8">
          {data.map((item) => {
            const value = Number(item[field] || 0);
            const height = value > 0 ? Math.max((value / max) * 100, 5) : 2;
            const targetPosition = target > 0 ? Math.min((target / max) * 100, 100) : 0;
            return <div key={item.date} className="relative flex h-full min-w-[34px] flex-1 flex-col items-center justify-end">
              {targetPosition > 0 && <div className={`absolute left-0 right-0 border-t border-dashed ${targetClass}`} style={{ bottom: `${targetPosition}%` }} />}
              <div title={`${Math.round(value)} ${unit}`} className={`relative z-10 w-full max-w-[34px] rounded-t-lg transition-all duration-500 ${barClass}`} style={{ height: `${height}%`, minHeight: value > 0 ? "8px" : "2px" }}>
                {value > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-slate-500">{Math.round(value)}{unit === "₹" ? "" : unit}</span>}
              </div>
              <span className="absolute -bottom-6 whitespace-nowrap text-[9px] font-medium text-slate-400">{formatDay(item.date)}</span>
            </div>;
          })}
        </div>
      )}
    </div>
  );
};

const HistoryRow = ({ day }) => (
  <tr className="border-t border-slate-50 transition hover:bg-green-50/30">
    <td className="px-6 py-4 text-sm font-bold text-slate-700">{formatDate(day.date)}</td>
    <td className="px-6 py-4 text-sm font-bold text-orange-600">{Math.round(day.calories || 0)} kcal</td>
    <td className="px-6 py-4 text-sm font-bold text-blue-600">{Math.round(day.protein || 0)}g</td>
    <td className="px-6 py-4 text-sm font-bold text-yellow-600">{Math.round(day.carbohydrates || day.carbs || 0)}g</td>
    <td className="px-6 py-4 text-sm font-bold text-purple-600">{Math.round(day.fat || 0)}g</td>
    <td className="px-6 py-4 text-sm font-bold text-green-600">{Math.round(day.fiber || 0)}g</td>
    <td className="px-6 py-4 text-sm font-bold text-green-700">₹{Math.round(day.spent || 0)}</td>
  </tr>
);

const HistoryMobileCard = ({ day }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
    <div className="flex items-center justify-between"><p className="text-sm font-black text-slate-800">{formatDate(day.date)}</p><span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">₹{Math.round(day.spent || 0)}</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <MobileValue label="Calories" value={`${Math.round(day.calories || 0)} kcal`} />
      <MobileValue label="Protein" value={`${Math.round(day.protein || 0)}g`} />
      <MobileValue label="Carbs" value={`${Math.round(day.carbohydrates || day.carbs || 0)}g`} />
      <MobileValue label="Fat" value={`${Math.round(day.fat || 0)}g`} />
      <MobileValue label="Fiber" value={`${Math.round(day.fiber || 0)}g`} />
    </div>
  </div>
);

const MobileValue = ({ label, value }) => <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-700">{value}</p></div>;

const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const formatDay = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });

const NutritionSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-56 rounded-[28px] bg-slate-200" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-40 rounded-3xl bg-slate-200" />)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><div className="h-80 rounded-3xl bg-slate-200" /><div className="h-80 rounded-3xl bg-slate-200" /></div>
  </div>
);

export default Nutrition;
