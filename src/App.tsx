import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Flame,
  Gauge,
  HeartPulse,
  Moon,
  Sparkles,
  Thermometer,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";
import { dailyMetrics, type DailyMetric } from "./data/ouraFixture";

type MetricKey =
  | "sleepScore"
  | "readinessScore"
  | "hrvAvg"
  | "restingHr"
  | "sleepDurationMinutes";

type Recap = {
  label: string;
  value: string;
  detail: string;
  date: string;
};

const sortedMetrics = [...dailyMetrics].sort((a, b) =>
  a.date.localeCompare(b.date),
);
const today = sortedMetrics[sortedMetrics.length - 1];
const yesterday = sortedMetrics[sortedMetrics.length - 2];
const trailingWeek = sortedMetrics.slice(-7);
const priorWeek = sortedMetrics.slice(-14, -7);
const baselineWindow = sortedMetrics.slice(0, -1);

function average(records: DailyMetric[], key: MetricKey) {
  if (!records.length) return 0;
  return (
    records.reduce((total, record) => total + record[key], 0) / records.length
  );
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function deltaLabel(current: number, comparison: number, suffix = "") {
  const delta = current - comparison;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(Math.abs(delta) < 10 ? 1 : 0)}${suffix}`;
}

function percentFromBaseline(current: number, baseline: number) {
  if (!baseline) return 0;
  return ((current - baseline) / baseline) * 100;
}

function scoreTone(score: number) {
  if (score >= 85) return "excellent";
  if (score >= 75) return "steady";
  if (score >= 68) return "mixed";
  return "rough";
}

function statusCopy(day: DailyMetric) {
  if (day.readinessScore >= 85 && day.sleepScore >= 85) {
    return {
      label: "Recovered",
      copy: "Sleep and readiness are both above your usual range.",
    };
  }
  if (day.readinessScore >= 76) {
    return {
      label: "Solid",
      copy: "A steady day. Nothing dramatic, which is its own small luxury.",
    };
  }
  if (day.readinessScore >= 68) {
    return {
      label: "Watch",
      copy: "Recovery is a little compressed. Keep an eye on the trend.",
    };
  }
  return {
    label: "Low",
    copy: "A rougher recovery day. Treat the numbers as context, not a verdict.",
  };
}

function findMax(records: DailyMetric[], key: MetricKey) {
  return records.reduce((best, record) =>
    record[key] > best[key] ? record : best,
  );
}

function findMin(records: DailyMetric[], key: MetricKey) {
  return records.reduce((best, record) =>
    record[key] < best[key] ? record : best,
  );
}

function buildLinePath(records: DailyMetric[], key: MetricKey) {
  const values = records.map((record) => record[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return records
    .map((record, index) => {
      const x = (index / (records.length - 1 || 1)) * 100;
      const y = 100 - ((record[key] - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildRecaps(records: DailyMetric[]): Recap[] {
  const longest = findMax(records, "sleepDurationMinutes");
  const shortest = findMin(records, "sleepDurationMinutes");
  const bestRecovery = findMax(records, "readinessScore");
  const highestHrv = findMax(records, "hrvAvg");
  const lowestHr = findMin(records, "restingHr");

  const biggestRebound = records.slice(1).reduce(
    (best, record, index) => {
      const previous = records[index];
      const rebound = record.readinessScore - previous.readinessScore;
      return rebound > best.rebound ? { record, rebound } : best;
    },
    { record: records[1], rebound: records[1].readinessScore - records[0].readinessScore },
  );

  return [
    {
      label: "Longest Sleep",
      value: formatDuration(longest.sleepDurationMinutes),
      detail: `Sleep score ${longest.sleepScore}`,
      date: longest.date,
    },
    {
      label: "Shortest Sleep",
      value: formatDuration(shortest.sleepDurationMinutes),
      detail: `Still logged ${shortest.sleepEfficiency}% efficiency`,
      date: shortest.date,
    },
    {
      label: "Best Recovery",
      value: `${bestRecovery.readinessScore}`,
      detail: `${bestRecovery.hrvAvg} ms HRV, ${bestRecovery.restingHr} bpm RHR`,
      date: bestRecovery.date,
    },
    {
      label: "Biggest Rebound",
      value: `+${biggestRebound.rebound}`,
      detail: "Readiness points overnight",
      date: biggestRebound.record.date,
    },
    {
      label: "Highest HRV",
      value: `${highestHrv.hrvAvg} ms`,
      detail: `${formatDuration(highestHrv.sleepDurationMinutes)} asleep`,
      date: highestHrv.date,
    },
    {
      label: "Lowest RHR",
      value: `${lowestHr.restingHr} bpm`,
      detail: `Readiness ${lowestHr.readinessScore}`,
      date: lowestHr.date,
    },
  ];
}

const status = statusCopy(today);
const baseline = {
  sleepScore: average(baselineWindow, "sleepScore"),
  readinessScore: average(baselineWindow, "readinessScore"),
  hrvAvg: average(baselineWindow, "hrvAvg"),
  restingHr: average(baselineWindow, "restingHr"),
  sleepDurationMinutes: average(baselineWindow, "sleepDurationMinutes"),
};
const weekAverage = average(trailingWeek, "readinessScore");
const priorWeekAverage = average(priorWeek, "readinessScore");
const recaps = buildRecaps(sortedMetrics);

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <nav className="top-bar" aria-label="Dashboard">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <Waves size={18} />
            </div>
            <div>
              <p className="eyebrow">HRVMax</p>
              <h1>Recovery dashboard</h1>
            </div>
          </div>
          <div className="data-source">
            <span>Local fixture</span>
            <strong>Updated {formatDate(today.date)}</strong>
          </div>
        </nav>

        <div className="status-grid">
          <section className={`today-status ${scoreTone(today.readinessScore)}`}>
            <div className="status-copy">
              <p className="eyebrow">Today</p>
              <h2>{status.label}</h2>
              <p>{status.copy}</p>
            </div>
            <div className="score-orbit" aria-label={`Readiness ${today.readinessScore}`}>
              <span>{today.readinessScore}</span>
              <small>readiness</small>
            </div>
          </section>

          <MetricCard
            icon={<Moon size={18} />}
            label="Sleep"
            value={`${today.sleepScore}`}
            detail={`${formatDuration(today.sleepDurationMinutes)} asleep`}
            delta={deltaLabel(today.sleepScore, baseline.sleepScore)}
            positive={today.sleepScore >= baseline.sleepScore}
          />
          <MetricCard
            icon={<HeartPulse size={18} />}
            label="HRV"
            value={`${today.hrvAvg} ms`}
            detail={`${percentFromBaseline(today.hrvAvg, baseline.hrvAvg).toFixed(1)}% vs baseline`}
            delta={deltaLabel(today.hrvAvg, yesterday.hrvAvg, " ms")}
            positive={today.hrvAvg >= yesterday.hrvAvg}
          />
          <MetricCard
            icon={<Activity size={18} />}
            label="Resting HR"
            value={`${today.restingHr} bpm`}
            detail={`${deltaLabel(today.restingHr, baseline.restingHr, " bpm")} vs baseline`}
            delta={deltaLabel(today.restingHr, yesterday.restingHr, " bpm")}
            positive={today.restingHr <= yesterday.restingHr}
          />
        </div>
      </section>

      <section className="section-band">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Last 7 Days</p>
            <h2>Recovery rhythm</h2>
          </div>
          <div className="week-change">
            {weekAverage >= priorWeekAverage ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>{deltaLabel(weekAverage, priorWeekAverage)} vs prior week</span>
          </div>
        </div>

        <div className="week-strip" aria-label="Seven day recovery strip">
          {trailingWeek.map((day) => (
            <article className="day-tile" key={day.date}>
              <div className="day-label">
                <span>{formatWeekday(day.date)}</span>
                <strong>{day.readinessScore}</strong>
              </div>
              <div className="day-bar">
                <span style={{ height: `${day.readinessScore}%` }} />
              </div>
              <p>{formatDuration(day.sleepDurationMinutes)}</p>
            </article>
          ))}
        </div>

        <div className="trend-grid">
          <TrendCard
            title="Readiness"
            value={`${today.readinessScore}`}
            path={buildLinePath(trailingWeek, "readinessScore")}
            accent="green"
          />
          <TrendCard
            title="Sleep Score"
            value={`${today.sleepScore}`}
            path={buildLinePath(trailingWeek, "sleepScore")}
            accent="blue"
          />
          <TrendCard
            title="HRV"
            value={`${today.hrvAvg} ms`}
            path={buildLinePath(trailingWeek, "hrvAvg")}
            accent="coral"
          />
        </div>
      </section>

      <section className="insight-layout">
        <div className="month-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">30 Days</p>
              <h2>Month map</h2>
            </div>
            <CalendarDays size={18} />
          </div>
          <div className="heatmap" aria-label="Readiness heatmap">
            {sortedMetrics.map((day) => (
              <div
                className={`heat-cell ${scoreTone(day.readinessScore)}`}
                key={day.date}
                title={`${formatDate(day.date)}: readiness ${day.readinessScore}`}
              >
                <span>{new Date(`${day.date}T12:00:00`).getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recap-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Recap</p>
              <h2>Sleep wrapped</h2>
            </div>
            <Sparkles size={18} />
          </div>
          <div className="recap-grid">
            {recaps.map((recap) => (
              <article className="recap-card" key={recap.label}>
                <span>{formatDate(recap.date)}</span>
                <h3>{recap.label}</h3>
                <strong>{recap.value}</strong>
                <p>{recap.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-band">
        <MetricRow
          icon={<Clock3 size={18} />}
          label="Sleep Window"
          value={`${formatTime(today.bedtimeStart)} - ${formatTime(today.bedtimeEnd)}`}
          helper={`${today.sleepEfficiency}% efficiency`}
        />
        <MetricRow
          icon={<Thermometer size={18} />}
          label="Temperature"
          value={`${today.temperatureDeviation > 0 ? "+" : ""}${today.temperatureDeviation.toFixed(1)} C`}
          helper="Deviation from baseline"
        />
        <MetricRow
          icon={<Gauge size={18} />}
          label="Respiration"
          value={`${today.respiratoryRate.toFixed(1)} rpm`}
          helper={`${today.spo2Avg.toFixed(1)}% SpO2 average`}
        />
        <MetricRow
          icon={<Flame size={18} />}
          label="Data Mode"
          value="Local"
          helper="OAuth and friends come later"
        />
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  delta,
  positive,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{icon}</span>
        <small className={positive ? "positive" : "negative"}>{delta}</small>
      </div>
      <h3>{label}</h3>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function TrendCard({
  title,
  value,
  path,
  accent,
}: {
  title: string;
  value: string;
  path: string;
  accent: "green" | "blue" | "coral";
}) {
  return (
    <article className={`trend-card ${accent}`}>
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={path} />
      </svg>
    </article>
  );
}

function MetricRow({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="metric-row">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <small>{helper}</small>
    </article>
  );
}

export default App;
