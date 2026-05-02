// Local notification scheduling for daily reminder + weekly summary.
// Uses the browser Notification API (works while the PWA is open or recently
// backgrounded). Persists "last fired" markers in localStorage to avoid
// duplicates across reloads, and does a catch-up at boot when the target
// time has already passed for the day/week.

import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTransactionStore } from '@/stores/useTransactionStore';

const DAILY_KEY = 'piggy-bud-last-daily-reminder';
const WEEKLY_KEY = 'piggy-bud-last-weekly-report';

let dailyTimer: ReturnType<typeof setTimeout> | null = null;
let weeklyTimer: ReturnType<typeof setTimeout> | null = null;

function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

async function showNotification(title: string, body: string, tag: string) {
  if (!canNotify()) return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, { body, tag, icon: '/favicon.ico', badge: '/favicon.ico' });
        return;
      }
    }
    new Notification(title, { body, tag, icon: '/favicon.ico' });
  } catch {
    // ignore
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekKey(): string {
  // ISO week-ish: year + week number based on Sunday.
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function parseHHMM(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return { h: isNaN(h) ? 20 : h, m: isNaN(m) ? 0 : m };
}

function nextDailyDelay(time: string): number {
  const { h, m } = parseHHMM(time);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function nextSundayDelay(time: string): number {
  const { h, m } = parseHHMM(time);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  // 0 = Sunday
  const daysUntilSunday = (7 - target.getDay()) % 7;
  if (daysUntilSunday === 0 && target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  } else {
    target.setDate(target.getDate() + daysUntilSunday);
  }
  return target.getTime() - now.getTime();
}

async function fireDaily() {
  if (!canNotify()) return;
  const last = localStorage.getItem(DAILY_KEY);
  if (last === todayStr()) return;
  localStorage.setItem(DAILY_KEY, todayStr());
  await showNotification(
    'Piggy Bud',
    'Vamos fechar o caixa do dia? Registre seus gastos antes de dormir 🐷',
    'piggy-daily'
  );
}

async function fireWeekly() {
  if (!canNotify()) return;
  const last = localStorage.getItem(WEEKLY_KEY);
  const wk = weekKey();
  if (last === wk) return;
  localStorage.setItem(WEEKLY_KEY, wk);

  const transactions = useTransactionStore.getState().transactions;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = transactions.filter((t) => new Date(t.date).getTime() >= sevenDaysAgo);
  const expenses = recent.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const income = recent.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const body = `Esta semana: R$ ${expenses.toFixed(2)} em gastos, R$ ${income.toFixed(2)} em receitas. Saldo: R$ ${(income - expenses).toFixed(2)}`;
  await showNotification('Resumo semanal', body, 'piggy-weekly');
}

function scheduleDaily(time: string) {
  if (dailyTimer) clearTimeout(dailyTimer);
  const delay = nextDailyDelay(time);
  dailyTimer = setTimeout(async () => {
    await fireDaily();
    scheduleDaily(time);
  }, delay);
}

function scheduleWeekly() {
  if (weeklyTimer) clearTimeout(weeklyTimer);
  const delay = nextSundayDelay('20:00');
  weeklyTimer = setTimeout(async () => {
    await fireWeekly();
    scheduleWeekly();
  }, delay);
}

export function cancelDaily() {
  if (dailyTimer) clearTimeout(dailyTimer);
  dailyTimer = null;
}

export function cancelWeekly() {
  if (weeklyTimer) clearTimeout(weeklyTimer);
  weeklyTimer = null;
}

export async function applyReminderSettings() {
  const { settings } = useSettingsStore.getState();

  // Daily
  if (settings.dailyReminderEnabled) {
    // Catch-up: if target time already passed today and we haven't fired, fire now.
    const { h, m } = parseHHMM(settings.reminderTime);
    const now = new Date();
    const passed = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
    if (passed) await fireDaily();
    scheduleDaily(settings.reminderTime);
  } else {
    cancelDaily();
  }

  // Weekly: Sunday 20:00, fire catch-up if today is Sunday and time passed.
  if (settings.weeklyReportEnabled) {
    const now = new Date();
    if (now.getDay() === 0 && (now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 0))) {
      await fireWeekly();
    }
    scheduleWeekly();
  } else {
    cancelWeekly();
  }
}

export function initReminders() {
  if (typeof window === 'undefined') return;
  // Defer slightly so stores hydrate from localStorage first.
  setTimeout(() => {
    applyReminderSettings().catch(() => {});
  }, 1500);
}
