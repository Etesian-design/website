<script setup lang="ts">
/**
 * Desktop Events (Desktop v2: the phone's Events view sliding in from the right, also the Overview's left column), with
 * XEventsPanel's x-ev markup and the site's content: the day and date (a click unfolds this month, a day can be picked),
 * the time with the weather beside it (the same as the phone's Events), then Notifications, Calendar (today) and Feeds;
 * a section with nothing in it is left out, header and all, as on the N9.
 */
import { ref, computed } from 'vue';
import HdEventsFeedItem from '@etesian-design/vue/components/HdEventsFeedItem.vue';
import HdSectionHeader from '@etesian-design/vue/components/HdSectionHeader.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import { useClock } from '../../lib/clock';
import { useNav } from '../../lib/nav';
import { EVENTS } from '../../content/site';
const { now, time, dayName, longDate } = useClock();
const nav = useNav();
const date = computed(() => longDate.value.replace(/^\w+,\s*/, ''));
const NOTES = EVENTS.notifications;
const FEEDS = EVENTS.feeds;
const CAL = EVENTS.calendar;

/* the month: this month's days, weeks starting on Monday; a picked day (today by default) */
const open = ref(false);
const picked = ref<number | null>(null);
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const month = computed(() => {
  const d = now.value; if (!d) return null;
  const first = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() + 6) % 7, days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return { name: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d), today: d.getDate(), cells: [...Array(first).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)] as number[] };
});
const sel = computed(() => picked.value ?? month.value?.today ?? 1);
const selLabel = computed(() => {
  const d = now.value; if (!d) return '';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(d.getFullYear(), d.getMonth(), sel.value));
});
</script>
<template>
  <aside class="x-ev hd-on-home" aria-label="Events">
    <header class="x-ev__top">
      <button type="button" class="x-ev__date hd-focusable" :aria-expanded="open ? 'true' : 'false'" :aria-label="`${dayName} ${date}, show month`" @click="open = !open">
        <span class="x-ev__day">{{ dayName }}</span>
        <span class="x-ev__dmy">{{ date }} <HdIcon :name="open ? 'chevron-down' : 'chevron-right'" :size="16" /></span>
      </button>
    </header>
    <div class="x-ev__now">
      <span class="x-ev__time">{{ time }}</span>
      <span class="x-ev__wx" aria-label="Athens, 23 degrees, partly cloudy">
        <svg class="x-ev__wxi" width="44" height="36" viewBox="0 0 44 36" aria-hidden="true">
          <circle cx="15" cy="13" r="8" fill="#FFC21A" />
          <g stroke="#FFC21A" stroke-width="2.4" stroke-linecap="round"><path d="M15 1v2.5M3 13h2.5M6.5 4.5l1.8 1.8M23.5 4.5l-1.8 1.8" /></g>
          <path d="M14 33h21a7 7 0 0 0 .6-14 9 9 0 0 0-17.2 2.6A5.7 5.7 0 0 0 14 33z" fill="currentColor" fill-opacity=".85" />
        </svg>
        <span class="x-ev__temp">23°</span>
        <span class="x-ev__city">Athens<small>Partly cloudy</small></span>
      </span>
    </div>

    <section v-if="open && month" class="x-ev__month" :aria-label="month.name">
      <div class="x-ev__mhead"><b>{{ month.name }}</b></div>
      <div class="x-ev__grid" role="grid">
        <span v-for="w in WEEK" :key="w" class="x-ev__wd" role="columnheader">{{ w }}</span>
        <template v-for="(d, i) in month.cells" :key="i">
          <span v-if="!d" class="x-ev__cell is-empty"></span>
          <button v-else type="button" role="gridcell" class="x-ev__cell hd-focusable" :class="{ 'is-today': d === month.today, 'is-sel': d === sel }" :aria-selected="d === sel ? 'true' : 'false'" @click="picked = d">
            <span class="x-ev__cn hd-sq">{{ d }}</span>
          </button>
        </template>
      </div>
      <h3 class="x-ev__selh">{{ selLabel }}</h3>
      <ul class="x-ev__lines">
        <template v-if="sel === month.today && CAL.length"><li v-for="c in CAL" :key="c.time + c.title"><b>{{ c.time }}</b><span>{{ c.title }}</span></li></template>
        <li v-else class="is-none"><span>No entries</span></li>
      </ul>
    </section>

    <div class="x-ev__feed">
      <HdSectionHeader title="Notifications" />
      <HdEventsFeedItem v-for="n in NOTES" :key="n.page + n.title" :title="n.title" :body="n.text" time="now" :icon="n.icon" :accent="n.color" class="site-ev__i" @click="nav.open(n.page)" />
      <template v-if="CAL.length">
        <HdSectionHeader title="Calendar" />
        <HdEventsFeedItem v-for="c in CAL" :key="c.time + c.title" :title="c.title" :body="c.text" :time="c.time" icon="calendar" accent="#EF5500" />
      </template>
      <HdSectionHeader title="Feeds" />
      <HdEventsFeedItem v-for="n in FEEDS" :key="n.page + n.title" :title="n.title" :body="n.text" time="today" :icon="n.icon" :accent="n.color" class="site-ev__i" @click="nav.open(n.page)" />
    </div>
  </aside>
</template>
<style>
.site-ev__i { cursor: pointer; }
.x-ev .x-ev__feed { overflow-y: auto; }
</style>
