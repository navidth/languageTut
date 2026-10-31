"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBookOpen,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { SKILL_NAMES } from "@/constants/skills";
import { type Skill, type SkillName } from "@/types/skill";
import { clearSkillFeedback, createSkill, deleteSkill, fetchSkills, updateSkill } from "@/store/skillsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AsyncState from "@/components/ui/AsyncState";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import { skillDescriptions, skillLabels } from "@/constants/skills";
import { skillIcons } from "@/constants/skills";
import { FIELD_CLASS_NAME } from "@/constants/ui";

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
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);

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

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await dispatch(deleteSkill(pendingDelete.id)).unwrap();
    } catch {
      // The rejected thunk stores the API message for the page.
    } finally {
      setPendingDelete(null);
    }
  }

  const loading = listStatus === "idle" || listStatus === "loading";

  return (
    <section className="mx-auto max-w-6xl">
      <div className="page-hero mb-7 flex flex-col gap-5 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-hero-muted mb-2 text-sm">پنل آموزشی</p>
          <h1 className="text-3xl font-black">مهارت‌های زبان</h1>
          <p className="page-hero-muted mt-2">
            چهار مهارت اصلی دوره‌های آموزش زبان و آیلتس
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreateForm}
            className="brand-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3"
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

      {loading && (
        <SkeletonGrid
          label="در حال دریافت مهارت‌ها"
          count={4}
          className="grid gap-5 md:grid-cols-2"
        />
      )}

      {listStatus === "failed" && (
        <AsyncState
          message={listError ?? "دریافت مهارت‌ها ناموفق بود."}
          retry={() => void dispatch(fetchSkills(page))}
        />
      )}

      {listStatus === "succeeded" && items.length === 0 && (
        <SkillsEmptyState canManage={canManage} onCreate={openCreateForm} />
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
                onDelete={() => setPendingDelete(skill)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            count={count}
            resultsCount={items.length}
            next={next}
            previous={previous}
            onPageChange={(requestedPage) => void dispatch(fetchSkills(requestedPage))}
            loading={loading}
            ariaLabel="صفحه‌بندی مهارت‌ها"
          />
        </>
      )}

      {canManage && (
        <ConfirmDialog
          open={pendingDelete !== null}
          tone="danger"
          title="حذف مهارت"
          description={
            pendingDelete
              ? `مهارت «${skillLabels[pendingDelete.name]}» حذف می‌شود و این کار برگشت‌پذیر نیست.`
              : undefined
          }
          confirmLabel="بله، حذف شود"
          loadingLabel="در حال حذف..."
          loading={mutationStatus === "loading"}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setPendingDelete(null)}
        />
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
    <article className="surface-card group rounded-3xl p-6 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-2xl text-brand-secondary dark:text-brand-accent">
          <Icon aria-hidden="true" />
        </span>
        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
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
          className="brand-link ml-auto"
        >
          مشاهده جزئیات ←
        </Link>
        {canManage && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="ghost-button rounded-lg px-3 py-2 text-sm"
            >
              ویرایش
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive-soft"
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-primary/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-form-title"
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
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
              className={FIELD_CLASS_NAME}
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
              className={FIELD_CLASS_NAME}
              disabled={loading}
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !Number.isInteger(order)}
              className="brand-button flex-1 rounded-xl px-5 py-3"
            >
              {loading ? "در حال ذخیره..." : "ذخیره"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="ghost-button rounded-xl px-5 py-3"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkillsEmptyState({
  canManage,
  onCreate,
}: {
  canManage: boolean;
  onCreate: () => void;
}) {
  return (
    <EmptyState
      icon={FaBookOpen}
      title="مهارتی ثبت نشده است"
      description="در حال حاضر موردی برای نمایش وجود ندارد."
      action={
        canManage && (
          <button
            type="button"
            onClick={onCreate}
            className="brand-button rounded-xl px-5 py-3"
          >
            افزودن اولین مهارت
          </button>
        )
      }
    />
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
      ? "feedback-success"
      : "feedback-error";

  return (
    <div
      role={color === "error" ? "alert" : "status"}
      className={`${compact ? "mt-4" : "mb-5"} rounded-2xl border p-4 ${colors}`}
    >
      {text}
    </div>
  );
}
