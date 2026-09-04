"use client";

import { FormEvent, useMemo, useState } from "react";

export function LabTools() {
  const [grams, setGrams] = useState(85);
  const [pricePerKg, setPricePerKg] = useState(18000);
  const [wastePct, setWastePct] = useState(8);

  const [watts, setWatts] = useState(220);
  const [hours, setHours] = useState(4.5);
  const [rwfPerKwh, setRwfPerKwh] = useState(280);

  const [eventTitle, setEventTitle] = useState("Campus pickup window");
  const [eventDate, setEventDate] = useState("");
  const [eventNote, setEventNote] = useState("");

  const filamentCost = useMemo(() => {
    const kg = Math.max(grams, 0) / 1000;
    const waste = 1 + Math.max(wastePct, 0) / 100;
    return Math.round(kg * waste * Math.max(pricePerKg, 0));
  }, [grams, pricePerKg, wastePct]);

  const energyCost = useMemo(() => {
    const kwh = (Math.max(watts, 0) * Math.max(hours, 0)) / 1000;
    return { kwh: kwh.toFixed(2), cost: Math.round(kwh * Math.max(rwfPerKwh, 0)) };
  }, [watts, hours, rwfPerKwh]);

  const daysUntil = useMemo(() => {
    if (!eventDate) return null;
    const target = new Date(`${eventDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }, [eventDate]);

  function saveReminder(e: FormEvent) {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;
    const existing = JSON.parse(localStorage.getItem("safehouse_reminders") || "[]") as Array<{
      title: string;
      date: string;
      note: string;
    }>;
    existing.unshift({ title: eventTitle, date: eventDate, note: eventNote });
    localStorage.setItem("safehouse_reminders", JSON.stringify(existing.slice(0, 8)));
    setEventNote("Saved locally on this device.");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3"
      >
        <span className="text-purple-400 text-[10px]">[ CALCULATOR 01 ]</span>
        <h4 className="text-white font-bold uppercase">Filament Cost Estimator</h4>
        <label className="block opacity-70">
          Print weight (g)
          <input
            type="number"
            min={0}
            value={grams}
            onChange={(e) => setGrams(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <label className="block opacity-70">
          Filament price (RWF / kg)
          <input
            type="number"
            min={0}
            value={pricePerKg}
            onChange={(e) => setPricePerKg(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <label className="block opacity-70">
          Waste / support (%)
          <input
            type="number"
            min={0}
            value={wastePct}
            onChange={(e) => setWastePct(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <p className="text-purple-200">Material estimate: {filamentCost.toLocaleString()} RWF</p>
      </form>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3"
      >
        <span className="text-purple-400 text-[10px]">[ CALCULATOR 02 ]</span>
        <h4 className="text-white font-bold uppercase">Power & Machine Hours</h4>
        <label className="block opacity-70">
          Printer draw (W)
          <input
            type="number"
            min={0}
            value={watts}
            onChange={(e) => setWatts(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <label className="block opacity-70">
          Job duration (hours)
          <input
            type="number"
            min={0}
            step={0.1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <label className="block opacity-70">
          Electricity (RWF / kWh)
          <input
            type="number"
            min={0}
            value={rwfPerKwh}
            onChange={(e) => setRwfPerKwh(Number(e.target.value))}
            className="mt-1 w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          />
        </label>
        <p className="text-purple-200">
          {energyCost.kwh} kWh · {energyCost.cost.toLocaleString()} RWF
        </p>
      </form>

      <form onSubmit={saveReminder} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
        <span className="text-purple-400 text-[10px]">[ ARCHIVED IDEA 03 ]</span>
        <h4 className="text-white font-bold uppercase">Event Reminder Engine</h4>
        <input
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          className="w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
          placeholder="Event title"
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full rounded px-2 py-1.5 bg-black/60 border border-white/20 text-white"
        />
        <button type="submit" className="w-full py-2 rounded-full bg-purple-600 text-white uppercase tracking-wider font-bold">
          Save reminder
        </button>
        <p className="opacity-70">
          {daysUntil === null
            ? "Pick a date to count down."
            : daysUntil >= 0
              ? `${daysUntil} day(s) remaining.`
              : `${Math.abs(daysUntil)} day(s) ago.`}
        </p>
        {eventNote && <p className="text-purple-200">{eventNote}</p>}
      </form>
    </div>
  );
}
