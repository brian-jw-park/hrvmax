function byDay(records = []) {
  return new Map(records.filter((record) => record.day).map((record) => [record.day, record]));
}

function groupByDay(records = []) {
  const grouped = new Map();
  for (const record of records) {
    if (!record.day) continue;
    const existing = grouped.get(record.day) ?? [];
    existing.push(record);
    grouped.set(record.day, existing);
  }
  return grouped;
}

function pickMainSleep(records = []) {
  const candidates = records.filter(
    (record) => record.type !== "deleted" && record.type !== "rest",
  );
  return (
    candidates.find((record) => record.type === "long_sleep") ??
    candidates.sort(
      (a, b) => (b.total_sleep_duration ?? 0) - (a.total_sleep_duration ?? 0),
    )[0]
  );
}

function secondsToMinutes(seconds) {
  return typeof seconds === "number" ? Math.round(seconds / 60) : null;
}

function firstNumber(...values) {
  return values.find((value) => typeof value === "number" && Number.isFinite(value)) ?? null;
}

export function normalizeOuraDailyMetrics({
  dailySleep = [],
  dailyReadiness = [],
  sleep = [],
  dailySpo2 = [],
}) {
  const sleepByDay = byDay(dailySleep);
  const readinessByDay = byDay(dailyReadiness);
  const detailSleepByDay = groupByDay(sleep);
  const spo2ByDay = byDay(dailySpo2);
  const allDays = [
    ...new Set([...sleepByDay.keys(), ...readinessByDay.keys(), ...detailSleepByDay.keys()]),
  ].sort();

  return allDays
    .map((day) => {
      const sleepSummary = sleepByDay.get(day);
      const readiness = readinessByDay.get(day);
      const mainSleep = pickMainSleep(detailSleepByDay.get(day));
      const spo2 = spo2ByDay.get(day);

      if (!sleepSummary || !readiness || !mainSleep) return null;

      const sleepDurationMinutes = secondsToMinutes(mainSleep.total_sleep_duration);
      const hrvAvg = firstNumber(mainSleep.average_hrv);
      const restingHr = firstNumber(mainSleep.lowest_heart_rate, mainSleep.average_heart_rate);
      const sleepScore = firstNumber(sleepSummary.score);
      const readinessScore = firstNumber(readiness.score);
      const sleepEfficiency = firstNumber(mainSleep.efficiency);
      const respiratoryRate = firstNumber(mainSleep.average_breath);
      const temperatureDeviation = firstNumber(readiness.temperature_deviation);
      const spo2Avg = firstNumber(spo2?.spo2_percentage?.average, spo2?.spo2_percentage?.avg);

      if (
        sleepDurationMinutes === null ||
        hrvAvg === null ||
        restingHr === null ||
        sleepScore === null ||
        readinessScore === null ||
        sleepEfficiency === null ||
        respiratoryRate === null ||
        temperatureDeviation === null ||
        !mainSleep.bedtime_start ||
        !mainSleep.bedtime_end
      ) {
        return null;
      }

      return {
        date: day,
        sleepScore,
        readinessScore,
        hrvAvg,
        restingHr,
        sleepDurationMinutes,
        sleepEfficiency,
        bedtimeStart: mainSleep.bedtime_start,
        bedtimeEnd: mainSleep.bedtime_end,
        temperatureDeviation,
        respiratoryRate,
        spo2Avg: spo2Avg ?? 0,
      };
    })
    .filter(Boolean);
}
