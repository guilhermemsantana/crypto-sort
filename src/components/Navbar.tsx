"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n, SupportedLocale } from "../contexts/locale";
import { useTheme } from "../contexts/theme";
import { useWallet } from "../contexts/wallet";

export function Navbar() {
  const {
    walletAddress,
    isConnecting,
    isChecking,
    connect,
    disconnect,
  } = useWallet();
  const { t, locale, availableLocales, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const truncateAddress = useCallback((address: string) => {
    if (address.length <= 10) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const handleWalletAction = useCallback(() => {
    if (walletAddress) {
      disconnect();
      return;
    }

    void connect();
  }, [connect, disconnect, walletAddress]);

  const walletLabel = walletAddress
    ? truncateAddress(walletAddress)
    : t.nav.wallet.idle;

  const walletButtonText = isChecking
    ? t.nav.wallet.checking
    : isConnecting
      ? t.nav.wallet.connecting
      : walletLabel;

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const renderNavLinks = () => (
    <ul className="flex flex-col gap-4 text-base font-semibold text-zinc-900 dark:text-white lg:flex-row lg:items-center lg:gap-6 lg:text-sm lg:font-medium lg:text-zinc-600 lg:dark:text-zinc-300">
      {t.nav.links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            onClick={closeMenu}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <a
          href="https://etherscan.io/address/0xd3bede0d95ff696c3545c2802b1b7f0f97b8f264"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          onClick={closeMenu}
        >
          {t.nav.contractLabel}
        </a>
      </li>
      <li>
        <a
          href="https://github.com/guilhermemsantana"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          onClick={closeMenu}
        >
          {t.nav.githubLabel}
        </a>
      </li>
    </ul>
  );

  return (
    <header className="border-b border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 lg:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label={t.nav.menuOpenLabel}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-semibold text-zinc-900 transition-colors dark:text-white">
            {t.nav.brand}
          </Link>
        </div>
        <nav aria-label={t.nav.navLabel} className="hidden lg:block">
          {renderNavLinks()}
        </nav>
        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={t.nav.themeToggleLabel}
            onClick={toggleTheme}
            className="relative h-10 w-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full border transition-colors duration-200 ${isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-zinc-200"}`}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-between px-3"
            >
              <span
                className={`transition-opacity duration-150 ${isDark ? "opacity-0" : "opacity-100 text-zinc-800"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                  <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span
                className={`transition-opacity duration-150 ${isDark ? "opacity-100 text-white" : "opacity-0"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 0 1 12.21 3a7 7 0 1 0 8.79 9.79z" />
                </svg>
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`absolute left-1 top-1 h-8 w-8 rounded-full shadow-md transition-transform duration-200 ${isDark ? "translate-x-0 bg-white" : "translate-x-10 bg-zinc-950"}`}
            />
            <span className="sr-only">{isDark ? t.nav.themeDarkLabel : t.nav.themeLightLabel}</span>
          </button>
          <label className="sr-only" htmlFor="language-picker">
            {t.nav.languagePickerLabel}
          </label>
          <div className="relative w-[130px]">
            <select
              id="language-picker"
              value={locale}
              onChange={(event) => setLocale(event.target.value as SupportedLocale)}
              className="w-full appearance-none rounded-full border border-zinc-200 bg-white py-2 pl-11 pr-9 text-sm font-medium text-transparent transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-transparent dark:focus:border-white"
              aria-label={t.nav.languagePickerLabel}
            >
              {availableLocales.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 rounded bg-white px-1 text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {locale.toUpperCase()}
            </span>
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M2.1 9h19.8" />
              <path d="M2.1 15h19.8" />
              <path d="M12 2.1a15.3 15.3 0 0 1 0 19.8" />
              <path d="M12 2.1a15.3 15.3 0 0 0 0 19.8" />
            </svg>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-700 dark:text-zinc-300"
              viewBox="0 0 10 6"
              aria-hidden="true"
            >
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={handleWalletAction}
            disabled={isConnecting || isChecking}
          >
            {walletButtonText}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[90%] flex-col gap-6 border-r border-zinc-200 bg-white px-5 py-6 shadow-xl transition dark:border-zinc-800 dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.navLabel}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-white" onClick={closeMenu}>
                {t.nav.brand}
              </Link>
              <button
                type="button"
                className="rounded-md border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={closeMenu}
                aria-label={t.nav.menuCloseLabel}
              >
                &times;
              </button>
            </div>
            <nav>{renderNavLinks()}</nav>
            <div className="mt-auto space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t.nav.themeToggleLabel}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDark}
                  aria-label={t.nav.themeToggleLabel}
                  onClick={toggleTheme}
                  className="relative h-9 w-16 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full border transition-colors duration-200 ${
                      isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-zinc-200"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-between px-3"
                  >
                    <span
                      className={`transition-opacity duration-150 ${isDark ? "opacity-0 text-zinc-800" : "opacity-100 text-zinc-800"}`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                        <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span
                      className={`transition-opacity duration-150 ${isDark ? "opacity-100 text-white" : "opacity-0"}`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path d="M21 12.79A9 9 0 0 1 12.21 3a7 7 0 1 0 8.79 9.79z" />
                      </svg>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute left-1 top-1 h-7 w-7 rounded-full shadow-md transition-transform duration-200 ${
                      isDark ? "translate-x-0 bg-white" : "translate-x-7 bg-zinc-950"
                    }`}
                  />
                  <span className="sr-only">{isDark ? t.nav.themeDarkLabel : t.nav.themeLightLabel}</span>
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400" htmlFor="mobile-language-picker">
                  {t.nav.languagePickerLabel}
                </label>
                <div className="relative">
                  <select
                    id="mobile-language-picker"
                    value={locale}
                    onChange={(event) => setLocale(event.target.value as SupportedLocale)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  >
                    {availableLocales.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                onClick={() => {
                  closeMenu();
                  handleWalletAction();
                }}
                disabled={isConnecting || isChecking}
              >
                {walletButtonText}
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
