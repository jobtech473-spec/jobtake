"use client";

import { ComponentType, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Database,
  EyeOff,
  Filter,
  GraduationCap,
  ListChecks,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { ManagedOption, ManagedOptions, ManagedOptionType, OPTION_TYPE_LABELS } from "@/lib/job-option-types";

type OptionMeta = {
  type: ManagedOptionType;
  singular: string;
  hint: string;
  placeholder: string;
  valuePlaceholder: string;
  swatch: string;
  icon: ComponentType<{ className?: string }>;
};

const TYPES: OptionMeta[] = [
  {
    type: "LOCATION",
    singular: "Location",
    hint: "Add, edit or remove locations.",
    placeholder: "e.g. Mumbai, India",
    valuePlaceholder: "Mumbai, India",
    swatch: "bg-blue-50 text-blue-600",
    icon: MapPin,
  },
  {
    type: "INDUSTRY",
    singular: "Industry",
    hint: "Manage industry dropdown values.",
    placeholder: "e.g. IT & Software",
    valuePlaceholder: "IT & Software",
    swatch: "bg-emerald-50 text-emerald-600",
    icon: BriefcaseBusiness,
  },
  {
    type: "ROLE",
    singular: "Job Role",
    hint: "Manage role suggestions used in job titles.",
    placeholder: "e.g. Sales Executive",
    valuePlaceholder: "Sales Executive",
    swatch: "bg-violet-50 text-violet-600",
    icon: UserRound,
  },
  {
    type: "KEYWORD",
    singular: "Keyword",
    hint: "Manage keyword tags used to highlight and filter jobs.",
    placeholder: "e.g. Urgent Hiring",
    valuePlaceholder: "Urgent Hiring",
    swatch: "bg-amber-50 text-amber-600",
    icon: Tag,
  },
  {
    type: "EDUCATION",
    singular: "Education",
    hint: "Manage minimum education levels used in job postings.",
    placeholder: "e.g. Under Graduate (UG)",
    valuePlaceholder: "Under Graduate (UG)",
    swatch: "bg-rose-50 text-rose-600",
    icon: GraduationCap,
  },
  {
    type: "PG_SPECIALIZATION",
    singular: "PG Specialization",
    hint: "Manage postgraduate specializations shown when PG education is selected.",
    placeholder: "e.g. MBA / PGDM",
    valuePlaceholder: "MBA / PGDM",
    swatch: "bg-indigo-50 text-indigo-600",
    icon: GraduationCap,
  },
  {
    type: "UG_SPECIALIZATION",
    singular: "UG Specialization",
    hint: "Manage undergraduate specializations shown when UG education is selected.",
    placeholder: "e.g. B.Tech/B.E.",
    valuePlaceholder: "B.Tech/B.E.",
    swatch: "bg-cyan-50 text-cyan-600",
    icon: GraduationCap,
  },
  {
    type: "DIPLOMA_SPECIALIZATION",
    singular: "Diploma Specialization",
    hint: "Manage diploma specializations shown when Diploma education is selected.",
    placeholder: "e.g. Diploma in Computer Engineering",
    valuePlaceholder: "Diploma in Computer Engineering",
    swatch: "bg-teal-50 text-teal-600",
    icon: GraduationCap,
  },
  {
    type: "ITI_SPECIALIZATION",
    singular: "ITI Specialization",
    hint: "Manage ITI trade specializations shown when ITI education is selected.",
    placeholder: "e.g. Electrician",
    valuePlaceholder: "Electrician",
    swatch: "bg-orange-50 text-orange-600",
    icon: GraduationCap,
  },
];

type Drafts = Record<ManagedOptionType, { label: string; value: string }>;
type StatusFilter = "ALL" | "ACTIVE" | "DISABLED";

function blankDrafts(): Drafts {
  return {
    LOCATION: { label: "", value: "" },
    INDUSTRY: { label: "", value: "" },
    ROLE: { label: "", value: "" },
    KEYWORD: { label: "", value: "" },
    EDUCATION: { label: "", value: "" },
    PG_SPECIALIZATION: { label: "", value: "" },
    UG_SPECIALIZATION: { label: "", value: "" },
    DIPLOMA_SPECIALIZATION: { label: "", value: "" },
    ITI_SPECIALIZATION: { label: "", value: "" },
    CTC: { label: "3 - 6 LPA", value: "3-6" },
    EXPERIENCE: { label: "1 - 3 years", value: "1-3" },
  };
}

function sortRows(rows: ManagedOption[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

function splitLocation(value: string) {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    name: parts[0] || value,
    region: parts.length > 2 ? parts[1] : "India",
    country: parts.length > 1 ? parts[parts.length - 1] : "India",
  };
}

function statCard(
  label: string,
  value: string | number,
  note: string,
  icon: ComponentType<{ className?: string }>,
  swatch: string,
) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${swatch}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-black text-zinc-950">{value}</div>
          <div className="mt-1 text-[15px] font-bold text-zinc-900">{label}</div>
          <div className="mt-1 text-sm font-medium text-zinc-800">{note}</div>
        </div>
      </div>
    </div>
  );
}

export function OptionsEditor({ options }: { options: ManagedOptions }) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<ManagedOptionType>("LOCATION");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Drafts>(() => blankDrafts());

  const activeMeta = TYPES.find((item) => item.type === activeType) ?? TYPES[0];
  const ActiveIcon = activeMeta.icon;
  const allRows = useMemo(() => sortRows(options[activeType] ?? []), [activeType, options]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRows.filter((row) => {
      const matchesQuery = !query || row.label.toLowerCase().includes(query) || row.value.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && row.active) ||
        (statusFilter === "DISABLED" && !row.active);
      return matchesQuery && matchesStatus;
    });
  }, [allRows, search, statusFilter]);

  const totalOptions = TYPES.reduce((count, item) => count + (options[item.type]?.length ?? 0), 0);
  const disabledOptions = TYPES.reduce((count, item) => count + (options[item.type]?.filter((row) => !row.active).length ?? 0), 0);
  const activeOptions = totalOptions - disabledOptions;

  function updateDraft(type: ManagedOptionType, field: "label" | "value", value: string) {
    setDrafts((current) => ({ ...current, [type]: { ...current[type], [field]: value } }));
  }

  async function patch(id: string, body: object) {
    setBusy(id);
    const res = await fetch(`/api/admin/options/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this value?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/options/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  async function create(type: ManagedOptionType) {
    const label = drafts[type].label.trim();
    const value = (drafts[type].value.trim() || label).trim();
    if (!label || !value) return;

    setBusy(`new-${type}`);
    const res = await fetch("/api/admin/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, label, value, sortOrder: options[type]?.length ?? 0 }),
    });
    setBusy(null);
    if (!res.ok) return;

    setDrafts((current) => ({ ...current, [type]: blankDrafts()[type] }));
    router.refresh();
  }

  function editRow(row: ManagedOption) {
    const label = prompt("Edit label", row.label)?.trim();
    if (!label || label === row.label) return;
    patch(row.id, { label });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {statCard("Master Categories", TYPES.length, "All dropdown groups", Database, "bg-blue-50 text-blue-600")}
        {statCard("Total Values", totalOptions.toLocaleString("en-IN"), "Across all categories", ListChecks, "bg-emerald-50 text-emerald-600")}
        {statCard("Disabled Values", disabledOptions, "Not visible in portal", EyeOff, "bg-orange-50 text-orange-500")}
        {statCard("Active Values", activeOptions, "Visible in job forms", CalendarDays, "bg-violet-50 text-violet-600")}
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-5">
            <h2 className="text-base font-black text-zinc-900">Master Categories</h2>
            <p className="mt-2 text-[15px] font-medium text-zinc-800">Select a category to manage its values.</p>
          </div>
          <div className="p-3">
            {TYPES.map(({ type, icon: Icon }) => {
              const selected = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setActiveType(type);
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition ${
                    selected ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-semibold">{OPTION_TYPE_LABELS[type]}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-sm font-bold text-zinc-900 shadow-sm">
                    {options[type]?.length ?? 0}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-300" />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${activeMeta.swatch}`}>
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">{OPTION_TYPE_LABELS[activeType]}</h2>
                  <p className="mt-1 text-[15px] font-medium text-zinc-800">{activeMeta.hint}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => create(activeType)}
                disabled={busy === `new-${activeType}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === `new-${activeType}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add {activeMeta.singular}
              </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(160px,240px)_auto] lg:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold uppercase tracking-[0.14em] text-zinc-900">{activeMeta.singular} name</span>
                <input
                  className="input"
                  value={drafts[activeType].label}
                  onChange={(event) => updateDraft(activeType, "label", event.target.value)}
                  placeholder={activeMeta.placeholder}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold uppercase tracking-[0.14em] text-zinc-900">Stored value</span>
                <input
                  className="input"
                  value={drafts[activeType].value}
                  onChange={(event) => updateDraft(activeType, "value", event.target.value)}
                  placeholder={activeMeta.valuePlaceholder}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative block">
                  <span className="sr-only">Search values</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-700 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder={`Search ${OPTION_TYPE_LABELS[activeType].toLowerCase()}...`}
                  />
                </label>
                <label className="relative block">
                  <span className="sr-only">Filter status</span>
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-[15px] font-semibold text-zinc-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="ALL">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[15px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs uppercase tracking-[0.16em] text-zinc-900">
                  <th className="px-5 py-3">{activeMeta.singular} Name</th>
                  <th className="px-5 py-3">{activeType === "LOCATION" ? "State / Region" : "Stored Value"}</th>
                  <th className="px-5 py-3">{activeType === "LOCATION" ? "Country" : "Order"}</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const location = splitLocation(row.value);
                  return (
                    <tr key={row.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="px-5 py-3">
                        <input
                          defaultValue={row.label}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            if (!value || value === row.label) return;
                            if (activeType === "LOCATION") {
                              const nextValue = `${value}, ${location.region}, ${location.country}`;
                              patch(row.id, { label: value, value: nextValue });
                            } else {
                              patch(row.id, { label: value });
                            }
                          }}
                          className="h-10 w-full rounded-lg border border-transparent bg-transparent px-2 font-bold text-zinc-900 outline-none transition focus:border-blue-200 focus:bg-blue-50/40"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          defaultValue={activeType === "LOCATION" ? location.region : row.value}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            if (!value) return;
                            if (activeType === "LOCATION") {
                              const nextValue = `${location.name}, ${value}, ${location.country}`;
                              if (nextValue !== row.value) patch(row.id, { value: nextValue });
                            } else if (value !== row.value) {
                              patch(row.id, { value });
                            }
                          }}
                          className="h-10 w-full rounded-lg border border-transparent bg-transparent px-2 text-zinc-900 outline-none transition focus:border-blue-200 focus:bg-blue-50/40"
                        />
                      </td>
                      <td className="px-5 py-3">
                        {activeType === "LOCATION" ? (
                          <span className="font-semibold text-zinc-900">{location.country}</span>
                        ) : (
                          <input
                            type="number"
                            defaultValue={row.sortOrder}
                            onBlur={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isInteger(value) && value !== row.sortOrder) patch(row.id, { sortOrder: value });
                            }}
                            className="h-10 w-24 rounded-lg border border-zinc-200 bg-white px-3 text-[15px] text-zinc-900 outline-none transition focus:border-blue-300"
                          />
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => patch(row.id, { active: !row.active })}
                          className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                            row.active ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-900"
                          }`}
                        >
                          {row.active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {busy === row.id && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                          <button
                            type="button"
                            onClick={() => editRow(row)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-blue-50 hover:text-blue-700"
                            aria-label={`Edit ${row.label}`}
                            title="Edit label"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(row.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${row.label}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[15px] font-medium text-zinc-900">
                      No values match this category and filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 text-[15px] font-medium text-zinc-900 md:flex-row md:items-center md:justify-between">
            <span>
              Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {allRows.length} {OPTION_TYPE_LABELS[activeType].toLowerCase()}
            </span>
            <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900">10 / page</span>
          </div>
        </section>
      </div>
    </div>
  );
}
