"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "../../contexts/locale";
import { useWallet } from "../../contexts/wallet";
import { getIntlLocale } from "../../lib/intlLocale";
import sorteios from "../../lib/sorteios.json";
import type { Sorteio, SorteioStatus } from "../../lib/sorteiosStore";
import ticketsData from "../../lib/tickets.json";

type TicketEntry = {
  sorteio_id: number;
  ticket_ids: number[];
};

type TicketStore = Record<string, TicketEntry[]>;

type SortOrder = "newest" | "oldest" | "priceAsc" | "priceDesc";

const drawsData = sorteios as Sorteio[];
const drawIndex = new Map(drawsData.map((draw) => [draw.id, draw]));

const normalizedTicketStore: Record<string, TicketEntry[]> = Object.entries(
  (ticketsData as TicketStore) ?? {}
).reduce((acc, [address, entries]) => {
  acc[address.toLowerCase()] = entries;
  return acc;
}, {} as Record<string, TicketEntry[]>);

export default function MyTicketsPage() {
  const { t, locale } = useI18n();
  const { tickets, nav, draws } = t;
  const { walletAddress, isChecking, isConnecting, connect } = useWallet();

  const [statusFilter, setStatusFilter] = useState<"all" | SorteioStatus>(
    "all"
  );
  const [coinFilter, setCoinFilter] = useState<"all" | string>("all");
  const [networkFilter, setNetworkFilter] = useState<"all" | string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const normalizedAddress = walletAddress?.toLowerCase() ?? null;
  const ownedTickets = normalizedAddress
    ? normalizedTicketStore[normalizedAddress] ?? []
    : [];

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

  const ticketsByDraw = useMemo(() => {
    return ownedTickets
      .map((group) => {
        const draw = drawIndex.get(group.sorteio_id);
        if (!draw) {
          return null;
        }
        return {
          draw,
          ticketIds: [...group.ticket_ids].sort((a, b) => a - b),
        };
      })
      .filter((item): item is { draw: Sorteio; ticketIds: number[] } =>
        Boolean(item)
      )
      .sort(
        (a, b) =>
          new Date(b.draw.start_date).getTime() -
          new Date(a.draw.start_date).getTime()
      );
  }, [ownedTickets]);

  const availableCoins = useMemo(() => {
    const uniqueCoins = new Set<string>();
    ticketsByDraw.forEach(({ draw }) => {
      if (draw.coin) {
        uniqueCoins.add(draw.coin);
      }
    });
    return Array.from(uniqueCoins).sort();
  }, [ticketsByDraw]);

  const availableNetworks = useMemo(() => {
    const uniqueNetworks = new Set<string>();
    ticketsByDraw.forEach(({ draw }) => {
      if (draw.network) {
        uniqueNetworks.add(draw.network);
      }
    });
    return Array.from(uniqueNetworks).sort();
  }, [ticketsByDraw]);

  const filteredTickets = useMemo(() => {
    return ticketsByDraw.filter(({ draw }) => {
      const statusMatches =
        statusFilter === "all" || draw.status === statusFilter;
      const coinMatches = coinFilter === "all" || draw.coin === coinFilter;
      const networkMatches =
        networkFilter === "all" || draw.network === networkFilter;
      return statusMatches && coinMatches && networkMatches;
    });
  }, [coinFilter, networkFilter, statusFilter, ticketsByDraw]);

  const sortedTickets = useMemo(() => {
    const list = [...filteredTickets];
    switch (sortOrder) {
      case "priceAsc":
        list.sort((a, b) => a.draw.tickets_price - b.draw.tickets_price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.draw.tickets_price - a.draw.tickets_price);
        break;
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.draw.start_date).getTime() -
            new Date(b.draw.start_date).getTime()
        );
        break;
      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.draw.start_date).getTime() -
            new Date(a.draw.start_date).getTime()
        );
        break;
    }
    return list;
  }, [filteredTickets, sortOrder]);

  const totalTickets = useMemo(
    () =>
      filteredTickets.reduce(
        (acc, item) => acc + item.ticketIds.length,
        0
      ),
    [filteredTickets]
  );

  const connectLabel = isConnecting
    ? nav.wallet.connecting
    : tickets.requiresWallet.action;
  const renderTicketBadges = (ids: number[]) => {
    if (ids.length === 0) {
      return (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {tickets.card.emptyTicketsLabel}
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <span
            key={id}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
          >
            #{numberFormatter.format(id)}
          </span>
        ))}
      </div>
    );
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = dateFormatter.format(new Date(startDate));
    if (!endDate) {
      return `${start} • ${tickets.card.openEndedLabel}`;
    }
    const end = dateFormatter.format(new Date(endDate));
    return `${start} • ${end}`;
  };

  const renderContent = () => {
    if (isChecking) {
      return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {tickets.loading}
          </p>
        </div>
      );
    }

    if (!walletAddress) {
      return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {tickets.requiresWallet.heading}
          </h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {tickets.requiresWallet.description}
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
            onClick={() => {
              if (!walletAddress) {
                void connect();
              }
            }}
            disabled={isConnecting}
          >
            {connectLabel}
          </button>
          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {tickets.requiresWallet.helper}
          </p>
        </div>
      );
    }

    if (ticketsByDraw.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {tickets.empty.title}
          </h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {tickets.empty.description}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-3">
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
                    }}
                    className="w-[150px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-700 transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="all">
                      {draws.active.networkOptions.all}
                    </option>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {tickets.summary.drawsLabel}
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
              {numberFormatter.format(filteredTickets.length)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {tickets.summary.ticketsLabel}
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
              {numberFormatter.format(totalTickets)}
            </p>
          </div>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center transition-colors dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 transition-colors dark:text-white">
              {draws.active.emptyTitle}
            </p>
            <p className="mt-3 text-sm text-zinc-600 transition-colors dark:text-zinc-300">
              {draws.active.emptyDescription}
            </p>
          </div>
        ) : (
          sortedTickets.map(({ draw, ticketIds }) => (
            <article
              key={draw.id}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {tickets.card.drawLabel} #{draw.id}
                  </p>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {draw.network} - {draw.coin}
                  </h3>
                </div>
                <Link
                  href={`/sorteios/${draw.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                >
                  {tickets.card.viewDrawCta}
                </Link>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {tickets.card.statusLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {draws.active.statusOptions[draw.status]}
                  </dd>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {tickets.card.priceLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {draw.coin} {coinAmountFormatter.format(draw.tickets_price)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {tickets.card.quantityLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {numberFormatter.format(ticketIds.length)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {tickets.card.timeLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                    {formatDateRange(draw.start_date, draw.end_date)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {tickets.card.ticketsLabel}
                </p>
                <div className="mt-3">{renderTicketBadges(ticketIds)}</div>
              </div>
            </article>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 px-4 py-10 transition-colors dark:from-zinc-950 dark:via-black dark:to-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {tickets.badge}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {tickets.title}
          </h1>
        </header>

        {renderContent()}
      </div>
    </div>
  );
}
