"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TicketPurchaseModal } from "../../components/TicketPurchaseModal";
import { useI18n } from "../../contexts/locale";
import { useWallet } from "../../contexts/wallet";
import { getIntlLocale } from "../../lib/intlLocale";
import sorteios from "../../lib/sorteios.json";
import type { Sorteio, SorteioStatus } from "../../lib/sorteiosStore";

type ModalDraw = Sorteio & {
  tickets_number?: number;
};

type SortOrder = "newest" | "oldest" | "priceAsc" | "priceDesc";

const pageSize = 4;
const allDraws = sorteios as ModalDraw[];

export default function SorteiosPage() {
  const { walletAddress, isChecking, isConnecting, connect } = useWallet();
  const { t, locale } = useI18n();
  const { draws } = t;

  const [drawList, setDrawList] = useState<ModalDraw[]>(allDraws);
  const [statusFilter, setStatusFilter] = useState<"all" | SorteioStatus>(
    "all"
  );
  const [coinFilter, setCoinFilter] = useState<"all" | string>("all");
  const [networkFilter, setNetworkFilter] = useState<"all" | string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketModalDraw, setTicketModalDraw] = useState<ModalDraw | null>(
    null
  );

  const intlLocale = getIntlLocale(locale);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(intlLocale),
    [intlLocale]
  );
  const coinAmountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }),
    [intlLocale]
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [intlLocale]
  );

  const availableCoins = useMemo(() => {
    const uniqueCoins = new Set<string>();
    drawList.forEach((draw) => {
      if (draw.coin) {
        uniqueCoins.add(draw.coin);
      }
    });
    return Array.from(uniqueCoins).sort();
  }, [drawList]);

  const availableNetworks = useMemo(() => {
    const uniqueNetworks = new Set<string>();
    drawList.forEach((draw) => {
      if (draw.network) {
        uniqueNetworks.add(draw.network);
      }
    });
    return Array.from(uniqueNetworks).sort();
  }, [drawList]);

  const filteredDraws = useMemo(
    () =>
      drawList.filter((draw) => {
        const statusMatches =
          statusFilter === "all" || draw.status === statusFilter;
        const coinMatches = coinFilter === "all" || draw.coin === coinFilter;
        const networkMatches =
          networkFilter === "all" || draw.network === networkFilter;
        return statusMatches && coinMatches && networkMatches;
      }),
    [coinFilter, drawList, networkFilter, statusFilter]
  );

  const sortedDraws = useMemo(() => {
    const list = [...filteredDraws];
    switch (sortOrder) {
      case "priceAsc":
        list.sort((a, b) => a.tickets_price - b.tickets_price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.tickets_price - a.tickets_price);
        break;
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        break;
    }
    return list;
  }, [filteredDraws, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(sortedDraws.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginatedDraws = sortedDraws.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleConnect = () => {
    if (!walletAddress) {
      void connect();
    }
  };

  const openTicketModal = (draw: ModalDraw) => {
    setTicketModalDraw(draw);
  };

  const closeTicketModal = () => {
    setTicketModalDraw(null);
  };

  const handleTicketModalDrawUpdate = (updated: ModalDraw) => {
    setDrawList((current) =>
      current.map((draw) => (draw.id === updated.id ? updated : draw))
    );
    setTicketModalDraw((current) =>
      current?.id === updated.id ? updated : current
    );
  };

  const getTotals = (draw: ModalDraw) => {
    const totalTickets =
      draw.total_number_tickets ??
      draw.tickets_number ??
      draw.tickets_sold?.length ??
      0;
    const soldTickets =
      draw.total_tickets_sold ?? draw.tickets_sold?.length ?? 0;
    return { totalTickets, soldTickets };
  };

  const renderProgress = (draw: ModalDraw) => {
    const { totalTickets, soldTickets } = getTotals(draw);
    if (totalTickets <= 0) {
      return 0;
    }
    const percent = (soldTickets / totalTickets) * 100;
    return Math.min(100, percent);
  };

  const renderDrawList = () => (
    <section className="rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:p-14">
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-3 text-sm font-medium">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span className="whitespace-nowrap">
                  {draws.active.filterLabel}
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as "all" | SorteioStatus
                    );
                    setCurrentPage(1);
                  }}
                  className="w-[150px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-700 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {Object.entries(draws.active.statusOptions).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:ml-auto sm:justify-end">
                <span className="whitespace-nowrap">
                  {draws.active.sortLabel}
                </span>
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(event.target.value as SortOrder);
                    setCurrentPage(1);
                  }}
                  className="w-[150px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-700 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {Object.entries(draws.active.sortOptions).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span className="whitespace-nowrap">
                  {draws.active.currencyFilterLabel}
                </span>
                <select
                  value={coinFilter}
                  onChange={(event) => {
                    setCoinFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[150px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-700 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">
                    {draws.active.currencyOptions.all}
                  </option>
                  {availableCoins.map((coin) => (
                    <option key={coin} value={coin}>
                      {coin}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:ml-auto sm:justify-end">
                <span className="whitespace-nowrap">
                  {draws.active.networkFilterLabel}
                </span>
                <select
                  value={networkFilter}
                  onChange={(event) => {
                    setNetworkFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[150px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-700 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">{draws.active.networkOptions.all}</option>
                  {availableNetworks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {draws.active.resultsLabel}: {filteredDraws.length}
        </div>

        {paginatedDraws.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center transition-colors dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 transition-colors dark:text-white">
              {draws.active.emptyTitle}
            </p>
            <p className="mt-3 text-sm text-zinc-600 transition-colors dark:text-zinc-300">
              {draws.active.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {paginatedDraws.map((draw) => {
              const { totalTickets, soldTickets } = getTotals(draw);
              const soldOut = totalTickets > 0 && soldTickets >= totalTickets;
              const soldPercent = renderProgress(draw);
              const formattedStartDate = dateFormatter.format(
                new Date(draw.start_date)
              );
              const formattedEndDate = draw.end_date
                ? dateFormatter.format(new Date(draw.end_date))
                : draws.active.noEndDateLabel;
              const totalPrizeValue =
                typeof draw.total_prize === "number" ? draw.total_prize : 0;
              const formattedTotalPrize = `${coinAmountFormatter.format(
                totalPrizeValue
              )} ${draw.coin}`;
              const formattedTicketPrice = `${coinAmountFormatter.format(
                draw.tickets_price
              )} ${draw.coin}`;

              return (
                <article
                  key={draw.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 transition-colors dark:text-white">
                        #{draw.id}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.startDateLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formattedStartDate}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.endDateLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formattedEndDate}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.statusLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {draws.active.statusOptions[draw.status] ??
                            draw.status}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.coinLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {draw.coin}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.networkLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {draw.network}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.priceLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formattedTicketPrice}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {draws.active.totalTicketsLabel}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {numberFormatter.format(totalTickets)}
                        </span>
                      </div>
                      <div className="mt-3 rounded-xl border border-zinc-300 bg-zinc-900 px-3 py-2 text-white transition-colors dark:border-white/30 dark:bg-white dark:text-zinc-900">
                        <p className="text-xs uppercase tracking-wide text-white/70 dark:text-zinc-500">
                          {draws.active.totalPrizeLabel}
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {formattedTotalPrize}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        <span>{draws.active.soldPercentageLabel}</span>
                        <span>{soldPercent.toFixed(2)}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-white"
                          style={{ width: `${Math.min(100, soldPercent)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/sorteios/${draw.id}`}
                        className="w-full rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                      >
                        {draws.active.detailsButton}
                      </Link>
                      <button
                        type="button"
                        className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                          soldOut
                            ? "cursor-not-allowed bg-zinc-400 text-white dark:bg-zinc-700 dark:text-zinc-300"
                            : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                        }`}
                        disabled={soldOut}
                        onClick={() => openTicketModal(draw)}
                        aria-haspopup="dialog"
                        aria-expanded={ticketModalDraw?.id === draw.id}
                      >
                        {soldOut
                          ? draws.active.buySoldOutLabel
                          : draws.active.buyCta}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {paginatedDraws.length > 0 && (
          <div className="flex flex-col items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300 sm:flex-row sm:justify-between">
            <span className="text-xs uppercase tracking-wide">
              {draws.active.pagination.page} {safePage}/{pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition enabled:hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:enabled:hover:bg-zinc-800"
                onClick={() =>
                  setCurrentPage((previous) => Math.max(1, previous - 1))
                }
                disabled={safePage === 1}
              >
                {draws.active.pagination.previous}
              </button>
              <button
                type="button"
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition enabled:hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:enabled:hover:bg-zinc-800"
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(pageCount, previous + 1)
                  )
                }
                disabled={safePage === pageCount}
              >
                {draws.active.pagination.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  const renderTicketModal = () => {
    if (!ticketModalDraw) {
      return null;
    }

    return (
      <TicketPurchaseModal
        draw={ticketModalDraw}
        onClose={closeTicketModal}
        onDrawUpdate={handleTicketModalDrawUpdate}
      />
    );
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-20 sm:px-10">
          <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:p-14">
            <p className="text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300">
              {draws.validating}
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-20 sm:px-10">
          <section className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 sm:p-14">
            <h2 className="text-xl font-semibold text-zinc-900 transition-colors dark:text-white">
              {draws.requiresWallet.heading}
            </h2>
            <p className="mt-3 text-sm text-zinc-600 transition-colors dark:text-zinc-300">
              {draws.requiresWallet.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto"
                onClick={handleConnect}
                disabled={isConnecting || isChecking}
              >
                {draws.requiresWallet.action}
              </button>
              <span className="text-xs uppercase tracking-wide text-zinc-500 transition-colors dark:text-zinc-400">
                {draws.requiresWallet.helper}
              </span>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 transition-colors dark:bg-gradient-to-b dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-20 sm:px-10">
          {renderDrawList()}
        </main>
      </div>
      {renderTicketModal()}
    </>
  );
}
