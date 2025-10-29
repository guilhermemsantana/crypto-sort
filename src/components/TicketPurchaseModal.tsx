"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../contexts/locale";
import { getIntlLocale } from "../lib/intlLocale";
import type { Sorteio } from "../lib/sorteiosStore";

type ModalDraw = Sorteio & {
  tickets_number?: number;
};

type TicketPurchaseModalProps = {
  draw: ModalDraw;
  onClose: () => void;
  onDrawUpdate?: (updated: ModalDraw) => void;
};

export function TicketPurchaseModal({ draw, onClose, onDrawUpdate }: TicketPurchaseModalProps) {
  const { t, locale } = useI18n();
  const { draws } = t;
  const intlLocale = getIntlLocale(locale);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }),
    [intlLocale],
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat(intlLocale), [intlLocale]);

  const [currentDraw, setCurrentDraw] = useState<ModalDraw>(draw);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDraw(draw);
    setStep("select");
    setSelectedTickets([]);
    setPurchaseError(null);
    setIsPurchasing(false);
  }, [draw]);

  const handleRequestClose = useCallback(() => {
    setStep("select");
    setSelectedTickets([]);
    setPurchaseError(null);
    setIsPurchasing(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleRequestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRequestClose]);

  useEffect(() => {
    if (selectedTickets.length === 0 && step === "confirm") {
      setStep("select");
    }
  }, [selectedTickets, step]);

  const getTotals = useCallback((drawData: ModalDraw) => {
    const totalTickets = drawData.total_number_tickets ?? drawData.tickets_number ?? drawData.tickets_sold?.length ?? 0;
    const soldTickets = drawData.total_tickets_sold ?? drawData.tickets_sold?.length ?? 0;
    return { totalTickets, soldTickets };
  }, []);

  const syncDraw = useCallback(async () => {
    try {
      const response = await fetch(`/api/sorteios/${currentDraw.id}`);
      if (!response.ok) {
        return null;
      }
      const latest = (await response.json()) as ModalDraw;
      setCurrentDraw(latest);
      onDrawUpdate?.(latest);
      return latest;
    } catch (error) {
      console.error("Failed to sync draw", error);
      return null;
    }
  }, [currentDraw.id, onDrawUpdate]);

  const handleToggleTicketSelection = (ticketNumber: number) => {
    const soldSet = new Set(currentDraw.tickets_sold ?? []);
    if (soldSet.has(ticketNumber)) {
      return;
    }
    setSelectedTickets((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(ticketNumber)) {
        nextSet.delete(ticketNumber);
      } else {
        nextSet.add(ticketNumber);
      }
      return Array.from(nextSet).sort((a, b) => a - b);
    });
    setPurchaseError(null);
  };

  const handleProceedToConfirm = () => {
    if (selectedTickets.length === 0) {
      return;
    }
    setStep("confirm");
    setPurchaseError(null);
  };

  const handleBackToSelection = () => {
    setStep("select");
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async () => {
    if (selectedTickets.length === 0) {
      return;
    }

    const ticketsToBuy = [...selectedTickets];
    const soldSet = new Set(currentDraw.tickets_sold ?? []);
    const unavailableTickets = ticketsToBuy.filter((ticket) => soldSet.has(ticket));

    if (unavailableTickets.length > 0) {
      setPurchaseError(draws.active.ticketModal.unavailableLabel);
      setStep("select");
      setSelectedTickets([]);
      await syncDraw();
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const response = await fetch(`/api/sorteios/${currentDraw.id}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketIds: ticketsToBuy }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setPurchaseError(draws.active.ticketModal.unavailableLabel);
          setStep("select");
          setSelectedTickets([]);
          await syncDraw();
        } else {
          setPurchaseError(draws.active.ticketModal.genericError);
        }
        return;
      }

      const updatedDraw = (await response.json()) as ModalDraw;
      setCurrentDraw(updatedDraw);
      onDrawUpdate?.(updatedDraw);
      setSelectedTickets([]);
      handleRequestClose();
    } catch (error) {
      console.error("Failed to confirm purchase", error);
      setPurchaseError(draws.active.ticketModal.genericError);
    } finally {
      setIsPurchasing(false);
    }
  };

  const { totalTickets } = getTotals(currentDraw);
  const tickets = totalTickets > 0 ? Array.from({ length: totalTickets }, (_, index) => index + 1) : [];
  const soldTickets = new Set(currentDraw.tickets_sold ?? []);
  const selectedTicketsSet = useMemo(() => new Set(selectedTickets), [selectedTickets]);
  const totalPrice = selectedTickets.length * currentDraw.tickets_price;
  const slideIndex = step === "select" ? 0 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={handleRequestClose} />
      <div
        id="ticket-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
        className="relative z-10 w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-colors dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="ticket-modal-title" className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {draws.active.ticketModal.title} #{currentDraw.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
          >
            {draws.active.ticketModal.closeLabel}
          </button>
        </div>
        <div className="mt-6">
          <div className="relative overflow-hidden">
            <div className="flex w-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
              <div className="w-full flex-shrink-0 pr-2">
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  {tickets.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-6 md:grid-cols-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(56px, 1fr))" }}>
                      {tickets.map((ticketNumber) => {
                        const isSold = soldTickets.has(ticketNumber);
                        const isSelected = selectedTicketsSet.has(ticketNumber);
                        return (
                          <button
                            key={ticketNumber}
                            type="button"
                            className={`flex h-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                              isSold
                                ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                                : isSelected
                                  ? "border-transparent bg-zinc-900 text-white shadow-sm ring-2 ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
                                  : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-white"
                            }`}
                            disabled={isSold}
                            aria-disabled={isSold}
                            aria-pressed={isSelected}
                            title={isSold ? draws.active.ticketModal.soldHint : draws.active.ticketModal.subtitle}
                            onClick={() => handleToggleTicketSelection(ticketNumber)}
                          >
                            #{ticketNumber}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      {draws.active.ticketModal.emptyLabel}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {selectedTickets.length === 0
                      ? draws.active.ticketModal.confirmPlaceholder
                      : `${draws.active.ticketModal.selectedLabel}: ${numberFormatter.format(selectedTickets.length)}`}
                  </p>
                  <button
                    type="button"
                    onClick={handleProceedToConfirm}
                    className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                    disabled={selectedTickets.length === 0}
                  >
                    {draws.active.ticketModal.reviewLabel}
                  </button>
                </div>
              </div>
              <div className="w-full flex-shrink-0 pl-2">
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <div className="space-y-5">
                    <div />
                    {selectedTickets.length > 0 ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-2">
                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.ticketModal.selectedLabel}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedTickets.map((ticketNumber) => (
                                <span
                                  key={ticketNumber}
                                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-white"
                                >
                                  #{ticketNumber}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.ticketModal.priceLabel}</p>
                            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{priceFormatter.format(currentDraw.tickets_price)}</p>
                          </div>
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.ticketModal.coinLabel}</p>
                              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">{currentDraw.coin ?? "-"}</p>
                            </div>
                            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{draws.active.ticketModal.networkLabel}</p>
                              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">{currentDraw.network ?? "-"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                          <div className="flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                            <span>{draws.active.ticketModal.totalLabel}</span>
                            <span>{priceFormatter.format(totalPrice)}</span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {numberFormatter.format(selectedTickets.length)} × {priceFormatter.format(currentDraw.tickets_price)}
                          </p>
                        </div>
                        {purchaseError && (
                          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-300" aria-live="assertive">
                            {purchaseError}
                          </p>
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleBackToSelection}
                            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                          >
                            {draws.active.ticketModal.backLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleConfirmPurchase()}
                            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                            disabled={isPurchasing}
                          >
                            {isPurchasing ? draws.active.ticketModal.processingLabel : draws.active.ticketModal.confirmCta}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                          {draws.active.ticketModal.confirmPlaceholder}
                        </div>
                        <button
                          type="button"
                          onClick={handleBackToSelection}
                          className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                        >
                          {draws.active.ticketModal.backLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
