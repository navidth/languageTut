"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBookOpen,
  FaHeadphones,
  FaMicrophone,
  FaPen,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import {
  SKILL_NAMES,
  type Skill,
  type SkillName,
} from "@/lib/skills";
import {
  clearSkillFeedback,
  createSkill,
  deleteSkill,
  fetchSkills,
  updateSkill,
} from "@/store/skillsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { skillDescriptions, skillLabels } from "./skillPresentation";

const skillIcons: Record<SkillName, IconType> = {
  listening: FaHeadphones,
  reading: FaBookOpen,
  writing: FaPen,
  speaking: FaMicrophone,
};

export default function SkillsDashboard() {
  const dispatch = useAppDispatch();
  const {
    items,
    count,
    page,
    next,
    previous,
    listStatus,
    listError,
    mutationStatus,
    mutationError,
    successMessage,
  } = useAppSelector((state) => state.skills);
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = role === "teacher" || role === "admin";
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [name, setName] = useState<SkillName>("listening");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    void dispatch(fetchSkills(1));
  }, [dispatch]);

  function openCreateForm() {
    dispatch(clearSkillFeedback());
    setEditing(null);
    setName("listening");
    setOrder(0);
    setFormOpen(true);
  }

  function openEditForm(skill: Skill) {
    dispatch(clearSkillFeedback());
    setEditing(skill);
    setName(skill.name);
    setOrder(skill.order);
    setFormOpen(true);
  }

  function closeForm() {
    if (mutationStatus === "loading") return;
    setFormOpen(false);
    setEditing(null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { name, order };

    try {
      if (editing) {
        await dispatch(
          updateSkill({ id: editing.id, data: payload }),
        ).unwrap();
      } else {
        await dispatch(createSkill(payload)).unwrap();
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      // The rejected thunk stores the API message for the form.
    }
  }

  async function remove(skill: Skill) {
    const confirmed = window.confirm(
      `آیا از حذف مهارت «${skillLabels[skill.name]}» مطمئن هستید؟`,
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteSkill(skill.id)).unwrap();
    } catch {
      // The rejected thunk stores the API message for the page.
    }
  }

  const loading = listStatus === "idle" || listStatus === "loading";

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col gap-5 rounded-3xl bg-gradient-to-l from-blue-800 to-blue-600 p-7 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-blue-100">پنل آموزشی</p>
          <h1 className="text-3xl font-black">مهارت‌های زبان</h1>
          <p className="mt-2 text-blue-100">
            چهار مهارت اصلی دوره‌های آموزش زبان و آیلتس
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50"
          >
            <FaPlus aria-hidden="true" />
            افزودن مهارت
          </button>
        )}
      </div>

      {successMessage && (
        <Feedback color="success" text={successMessage} />
      )}
      {!formOpen && mutationError && (
        <Feedback color="error" text={mutationError} />
      )}

      {loading && <LoadingState />}

      {listStatus === "failed" && (
        <ErrorState
          message={listError ?? "دریافت مهارت‌ها ناموفق بود."}
          retry={() => void dispatch(fetchSkills(page))}
        />
      )}

      {listStatus === "succeeded" && items.length === 0 && (
        <EmptyState canManage={canManage} onCreate={openCreateForm} />
      )}

      {listStatus === "succeeded" && items.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{count.toLocaleString("fa-IR")} مهارت</span>
            <span>صفحه {page.toLocaleString("fa-IR")}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                canManage={canManage}
                deleting={
                  mutationStatus === "loading" && editing?.id !== skill.id
                }
                onEdit={() => openEditForm(skill)}
                onDelete={() => void remove(skill)}
              />
            ))}
          </div>

          {(next || previous) && (
            <nav
              className="mt-7 flex items-center justify-center gap-3"
              aria-label="صفحه‌بندی مهارت‌ها"
            >
              <button
                type="button"
                disabled={!previous || loading}
                onClick={() => void dispatch(fetchSkills(page - 1))}
                className="rounded-xl border border-border bg-card px-5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                صفحه قبل
              </button>
              <button
                type="button"
                disabled={!next || loading}
                onClick={() => void dispatch(fetchSkills(page + 1))}
                className="rounded-xl border border-border bg-card px-5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                صفحه بعد
              </button>
            </nav>
          )}
        </>
      )}

      {formOpen && canManage && (
        <SkillForm
          editing={editing}
          name={name}
          order={order}
          loading={mutationStatus === "loading"}
          error={mutationError}
          onNameChange={setName}
          onOrderChange={setOrder}
          onClose={closeForm}
          onSubmit={submitForm}
        />
      )}
    </section>
  );
}

function SkillCard({
  skill,
  canManage,
  deleting,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  canManage: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = skillIcons[skill.name];

  return (
    <article className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Icon aria-hidden="true" />
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          ترتیب {skill.order.toLocaleString("fa-IR")}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-black">{skillLabels[skill.name]}</h2>
      <p className="mt-2 min-h-14 text-sm leading-7 text-muted-foreground">
        {skillDescriptions[skill.name]}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Link
          href={`/student/skills/${skill.id}`}
          className="ml-auto font-bold text-primary"
        >
          مشاهده جزئیات ←
        </Link>
        {canManage && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
            >
              ویرایش
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
            >
              <FaTrash aria-hidden="true" />
              حذف
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function SkillForm({
  editing,
  name,
  order,
  loading,
  error,
  onNameChange,
  onOrderChange,
  onClose,
  onSubmit,
}: {
  editing: Skill | null;
  name: SkillName;
  order: number;
  loading: boolean;
  error: string | null;
  onNameChange: (name: SkillName) => void;
  onOrderChange: (order: number) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-form-title"
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl"
      >
        <h2 id="skill-form-title" className="text-2xl font-black">
          {editing ? "ویرایش مهارت" : "افزودن مهارت"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          نام مهارت مطابق گزینه‌های مجاز API و ترتیب بین ۰ تا ۳۲٬۷۶۷ است.
        </p>
        {error && <Feedback color="error" text={error} compact />}
        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">نام مهارت</span>
            <select
              value={name}
              onChange={(event) =>
                onNameChange(event.target.value as SkillName)
              }
              className="w-full rounded-xl border border-input bg-background px-4 py-3"
              disabled={loading}
            >
              {SKILL_NAMES.map((skillName) => (
                <option key={skillName} value={skillName}>
                  {skillLabels[skillName]} ({skillName})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">ترتیب نمایش</span>
            <input
              type="number"
              min={0}
              max={32767}
              required
              value={order}
              onChange={(event) =>
                onOrderChange(
                  Number.isNaN(event.target.valueAsNumber)
                    ? 0
                    : event.target.valueAsNumber,
                )
              }
              className="w-full rounded-xl border border-input bg-background px-4 py-3"
              disabled={loading}
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !Number.isInteger(order)}
              className="flex-1 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "در حال ذخیره..." : "ذخیره"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-3 disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="grid gap-5 md:grid-cols-2"
      role="status"
      aria-label="در حال دریافت مهارت‌ها"
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-3xl border border-border bg-card p-6"
        >
          <div className="size-14 rounded-2xl bg-secondary" />
          <div className="mt-5 h-6 w-1/3 rounded bg-secondary" />
          <div className="mt-4 h-4 w-full rounded bg-secondary" />
          <div className="mt-2 h-4 w-2/3 rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  canManage,
  onCreate,
}: {
  canManage: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
      <FaBookOpen
        className="mx-auto text-4xl text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-xl font-black">مهارتی ثبت نشده است</h2>
      <p className="mt-2 text-muted-foreground">
        در حال حاضر موردی برای نمایش وجود ندارد.
      </p>
      {canManage && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          افزودن اولین مهارت
        </button>
      )}
    </div>
  );
}

function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
      <p>{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 rounded-xl bg-red-700 px-5 py-2 font-bold text-white"
      >
        تلاش دوباره
      </button>
    </div>
  );
}

function Feedback({
  color,
  text,
  compact = false,
}: {
  color: "success" | "error";
  text: string;
  compact?: boolean;
}) {
  const colors =
    color === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
      : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200";

  return (
    <div
      role={color === "error" ? "alert" : "status"}
      className={`${compact ? "mt-4" : "mb-5"} rounded-2xl border p-4 ${colors}`}
    >
      {text}
    </div>
  );
}
