"use client";

import Link from "next/link";
import { useI18n } from "../contexts/locale";

export default function Home() {
  const { t } = useI18n();
  const { home } = t;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-10">
        <section className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:p-16 sm:text-left">
          <div className="mx-auto max-w-3xl">
            <span className="mb-4 inline-flex items-center rounded-full bg-zinc-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 transition-colors dark:bg-zinc-800 dark:text-zinc-300">
              {home.badge}
            </span>
            <h1 className="text-4xl font-semibold text-zinc-900 transition-colors dark:text-white sm:text-5xl">
              {home.heading}
            </h1>
            <p className="mt-6 text-lg text-zinc-600 transition-colors dark:text-zinc-300">
              {home.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <Link
                href="/sorteios"
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {home.primaryAction}
              </Link>
              <span className="text-sm text-zinc-500 transition-colors dark:text-zinc-400">
                {home.primaryHelper}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {home.benefits.map((card) => (
            <article
              key={card.title}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-transform transition-colors hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 transition-colors dark:text-white">{card.title}</h2>
                <p className="mt-4 text-sm text-zinc-600 transition-colors dark:text-zinc-300">{card.description}</p>
              </div>
              <div className="mt-6 h-1 w-12 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-700 dark:bg-zinc-950 sm:p-16">
          <h3 className="text-2xl font-semibold text-zinc-900 transition-colors dark:text-white sm:text-3xl">
            {home.ctaSection.heading}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 transition-colors dark:text-zinc-300 sm:text-base">
            {home.ctaSection.description}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button className="w-full rounded-full border border-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-zinc-900 sm:w-auto">
              {home.ctaSection.button}
            </button>
            <span className="text-xs uppercase tracking-wide text-zinc-500 transition-colors dark:text-zinc-400">
              {home.ctaSection.helper}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
