/**
 * A live clock shared by the menu bar, the status bar and the lock screen (24-hour, like the N9).
 * Pages are generated at build time (SSG), so the time is left empty until the page runs in the browser: the generated
 * HTML never carries the build's time, and the first client render matches it.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
export function useClock() {
  const now = ref<Date | null>(null);
  let t = 0;
  onMounted(() => { now.value = new Date(); t = window.setInterval(() => (now.value = new Date()), 10_000); });
  onBeforeUnmount(() => window.clearInterval(t));
  const fmt = (o: Intl.DateTimeFormatOptions) => computed(() => (now.value ? new Intl.DateTimeFormat('en-GB', o).format(now.value) : ''));
  return {
    now,
    time: fmt({ hour: '2-digit', minute: '2-digit', hour12: false }),
    longDate: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    shortDate: fmt({ weekday: 'short', day: 'numeric', month: 'short' }),
    dayName: fmt({ weekday: 'long' }),
    dayMonth: fmt({ day: 'numeric', month: 'long' }),
  };
}
