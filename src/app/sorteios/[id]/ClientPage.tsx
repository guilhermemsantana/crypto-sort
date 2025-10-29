"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TicketPurchaseModal } from "../../../components/TicketPurchaseModal";
import { useI18n } from "../../../contexts/locale";
import { getIntlLocale } from "../../../lib/intlLocale";
import type { Sorteio } from "../../../lib/sorteiosStore";
import sorteios from "../../../lib/sorteios.json";

type SorteioDetailClientProps = {
  id: number;
};

export function SorteioDetailClient({ id }: SorteioDetailClientProps) {
  const { t, locale } = useI18n();
  const { draws } = t;
  const [draw, setDraw] = useState<Sorteio | null>(() => {
    const local = (sorteios as Sorteio[]).find((item) => item.id === id);
    return local ?? null;
  });
  const [isLoading, setIsLoading] = useState(() => !draw);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(() => !draw);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const intlLocale = getIntlLocale(locale);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(intlLocale), [intlLocale]);
  const coinAmountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }),
    [intlLocale],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [intlLocale],
  );

  const formatDateTime = useCallback((value: string) => dateFormatter.format(new Date(value)), [dateFormatter]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function load() {
      if (id <= 0) {
        setDraw(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);
      try {
        const response = await fetch(`/api/sorteios/${id}`, { signal: controller.signal });

        if (response.status === 404) {
          if (isMounted) {
            setDraw(null);
            setNotFound(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("failed");
        }

        const data = (await response.json()) as Sorteio;
        if (isMounted) {
          setDraw(data);
          setNotFound(false);
        }
      } catch (error) {
        if (!isMounted || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("Erro ao carregar detalhes do sorteio", error);
        if (isMounted) {
          setLoadError(draws.details.loadError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [draws.details.loadError, id]);

  useEffect(() => {
    if (!draw) {
      setIsTicketModalOpen(false);
    }
  }, [draw]);

  const renderBackLink = () => (
    <Link
      href="/sorteios"
      className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
    >
      &larr; {draws.details.backToList}
    </Link>
  );

  const handleOpenTicketModal = () => {
    if (!draw || draw.total_tickets_sold >= draw.total_number_tickets) {
      return;
    }
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  const handleTicketModalDrawUpdate = (updated: Sorteio) => {
    setDraw(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
          {renderBackLink()}
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-200">{draws.details.loadingLabel}</p>
          </section>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
          {renderBackLink()}
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center shadow-sm transition-colors dark:border-red-900/60 dark:bg-red-950/40">
            <p className="text-sm font-semibold text-red-700 dark:text-red-200">{loadError}</p>
          </section>
        </main>
      </div>
    );
  }

  if (!draw || notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
          {renderBackLink()}
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-2xl font-semibold text-zinc-900 transition-colors dark:text-white">{draws.details.notFoundTitle}</p>
            <p className="mt-3 text-sm text-zinc-600 transition-colors dark:text-zinc-300">{draws.details.notFoundDescription}</p>
            <div className="mt-6">
              <Link
                href="/sorteios"
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {draws.details.notFoundCta}
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const soldPercentage = Math.min(100, Math.floor((draw.total_tickets_sold / draw.total_number_tickets) * 100));
  const formattedTicketPrice = `${coinAmountFormatter.format(draw.tickets_price)} ${draw.coin}`;
  const formattedTotalPrize = `${coinAmountFormatter.format(draw.total_prize)} ${draw.coin}`;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-8">
          {renderBackLink()}

          <section className="mt-8 space-y-8">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg transition-colors dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500 transition-colors dark:text-zinc-400">
                    {draws.details.idLabel}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-zinc-900 transition-colors dark:text-white">#{draw.id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                    {draws.active.statusLabel}: {draws.active.statusOptions[draw.status]}
                  </span>
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-zinc-600 transition-colors dark:text-zinc-300 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.priceLabel}</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">{formattedTicketPrice}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.startDateLabel}</p>
                  <p className="mt-1 font-medium text-zinc-900 dark:text-white">{formatDateTime(draw.start_date)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.endDateLabel}</p>
                  <p className="mt-1 font-medium text-zinc-900 dark:text-white">
                    {draw.end_date ? formatDateTime(draw.end_date) : draws.active.openEndedLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
                <div className="h-[230px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.details.metricsTitle}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.totalTicketsLabel}</p>
                      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{numberFormatter.format(draw.total_number_tickets)}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.soldPercentageLabel}</p>
                      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{soldPercentage}%</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors dark:border-white/20 dark:bg-white dark:text-zinc-900">
                      <p className="text-xs uppercase tracking-wide text-white/70 dark:text-zinc-500">{draws.active.totalPrizeLabel}</p>
                      <p className="mt-2 text-3xl font-semibold break-words">{formattedTotalPrize}</p>
                    </div>
                  </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span>{draws.active.detailsLabel}</span>
                    <span>
                      {numberFormatter.format(draw.total_tickets_sold)}/{numberFormatter.format(draw.total_number_tickets)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 transition-all dark:from-white dark:to-zinc-300" style={{ width: `${soldPercentage}%` }} />
                  </div>
                </div>
              </div>

              <div className="h-[200px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.details.financeTitle}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.details.coinLabel}</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{draw.coin}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.details.networkLabel}</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">{draw.network}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-4 sm:flex-row">
              <Link
                href="/sorteios"
                className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 text-center"
              >
                {draws.details.backToList}
              </Link>
              <button
                type="button"
                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  draw.total_tickets_sold >= draw.total_number_tickets
                    ? "cursor-not-allowed bg-zinc-400 text-white dark:bg-zinc-700 dark:text-zinc-300"
                    : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                }`}
                onClick={handleOpenTicketModal}
                aria-haspopup="dialog"
                aria-expanded={isTicketModalOpen}
                disabled={draw.total_tickets_sold >= draw.total_number_tickets}
              >
                {draw.total_tickets_sold >= draw.total_number_tickets ? draws.active.buySoldOutLabel : draws.active.buyCta}
              </button>
            </div>
          </section>
        </main>
      </div>
      {draw && isTicketModalOpen && (
        <TicketPurchaseModal draw={draw} onClose={handleCloseTicketModal} onDrawUpdate={handleTicketModalDrawUpdate} />
      )}
    </>
  );
}
