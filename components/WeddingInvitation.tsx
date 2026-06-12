"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const coverImage = "/uploads/IMG_0234.JPEG";

const slides = [
  coverImage,
  "/uploads/IMG_0233.JPEG",
  "/uploads/IMG_0236.JPEG",
  "/uploads/IMG_0235.JPEG",
  "/uploads/IMG_0239.JPEG",
  "/uploads/IMG_0238.JPEG",
  "/uploads/IMG_0223.JPEG",
];

const slideChromeColors = [
  "#2e5882",
  "#294f7b",
  "#31537c",
  "#335a84",
  "#245081",
  "#204e81",
  "#355983",
];

const sections = [
  "Welcome",
  "Invitation",
  "Ceremony",
  "Registry",
  "RSVP",
  "Together",
];
const weddingDate = new Date("2026-08-16T17:30:00").getTime();

type Countdown = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
};

type RsvpStatus = "pending" | "accepted" | "rejected";

type Invitee = {
  id: string;
  fullName?: string;
  status?: RsvpStatus;
};

type InvitationResponse = {
  invitationCode?: string;
  invitees?: Invitee[];
};

const API_BASE_URL = "https://api.mywedding.events";

function getCountdown(): Countdown {
  const remaining = Math.max(weddingDate - Date.now(), 0);
  const totalSeconds = Math.floor(remaining / 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");

  return {
    days: pad(Math.floor(totalSeconds / 86400)),
    hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    mins: pad(Math.floor((totalSeconds % 3600) / 60)),
    secs: pad(totalSeconds % 60),
  };
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="9"
        width="28"
        height="25"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6 16h28M13 5v7M27 5v7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="44"
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 3C12.8 3 7 8.8 7 16c0 9 13 24 13 24s13-15 13-24c0-7.2-5.8-13-13-13z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="20" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

function ButtonLink({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[2px] border border-[var(--gold-line)] bg-white/[0.04] px-[26px] py-[13px] font-serif-wedding text-base uppercase tracking-[0.12em] text-[var(--ink)] no-underline transition duration-300 ease-in-out hover:border-[var(--ink)] hover:bg-white/[0.14] active:scale-95 ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function RsvpButton({
  label,
  variant,
  active,
  onClick,
}: {
  label: string;
  variant: "accept" | "decline";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex min-w-[82px] cursor-pointer items-center justify-center rounded-[2px] border px-[13px] py-[9px] font-serif-wedding text-xs uppercase tracking-[0.08em] transition duration-300 active:scale-95 ${
        active
          ? variant === "accept"
            ? "border-transparent bg-[oklch(0.82_0.075_78/0.9)] font-semibold text-[#3a2615]"
            : "border-transparent bg-[rgba(252,246,238,0.92)] font-semibold text-[#4a3220]"
          : "border-[var(--gold-line)] bg-white/[0.04] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-white/[0.14]"
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const STARTUP_TIMEOUT_MS = 6000;

function waitForWindowLoad(signal: AbortSignal) {
  if (document.readyState === "complete") return Promise.resolve();

  return new Promise<void>((resolve) => {
    const done = () => resolve();
    window.addEventListener("load", done, { once: true, signal });
  });
}

function waitForStylesheet(link: HTMLLinkElement, signal: AbortSignal) {
  if (link.sheet) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const done = () => resolve();
    link.addEventListener("load", done, { once: true, signal });
    link.addEventListener("error", done, { once: true, signal });
  });
}

async function waitForPageAssets(signal: AbortSignal) {
  const stylesheetLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"]'),
  );
  const ready = async () => {
    await Promise.all([
      waitForWindowLoad(signal),
      ...stylesheetLinks.map((link) => waitForStylesheet(link, signal)),
    ]);
    if ("fonts" in document) await document.fonts.ready;
  };
  const timeout = new Promise<void>((resolve) =>
    window.setTimeout(resolve, STARTUP_TIMEOUT_MS),
  );

  await Promise.race([ready(), timeout]);
}

export default function WeddingInvitation({
  invitationCode,
}: {
  invitationCode?: string;
}) {
  const [appReady, setAppReady] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [countdown, setCountdown] = useState<Countdown>({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
  });
  const [activeSection, setActiveSection] = useState(0);
  const [cueHidden, setCueHidden] = useState(false);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const lockRef = useRef(false);
  const currentRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const sectionIds = useMemo(
    () => sections.map((_, index) => `section-${index + 1}`),
    [],
  );
  const activeChromeColor =
    slideChromeColors[activeSlide] ?? slideChromeColors[0] ?? "#2e5882";
  const normalizedInvitationCode = invitationCode?.trim();

  useEffect(() => {
    const controller = new AbortController();

    waitForPageAssets(controller.signal)
      .catch(() => undefined)
      .then(() => {
        if (controller.signal.aborted) return;
        document.body.style.visibility = "visible";
        setAppReady(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const slideTimer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length);
    }, 3000);
    setCountdown(getCountdown());
    const countdownTimer = window.setInterval(
      () => setCountdown(getCountdown()),
      1000,
    );

    return () => {
      window.clearInterval(slideTimer);
      window.clearInterval(countdownTimer);
    };
  }, [appReady]);

  useEffect(() => {
    if (!appReady) return;

    const themeColorMeta =
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
      document.head.appendChild(document.createElement("meta"));

    themeColorMeta.name = "theme-color";
    themeColorMeta.content = activeChromeColor;
    document.documentElement.style.setProperty(
      "--slide-chrome-color",
      activeChromeColor,
    );
    document.documentElement.style.backgroundColor = activeChromeColor;
    document.body.style.backgroundColor = activeChromeColor;
  }, [activeChromeColor, appReady]);

  useEffect(() => {
    if (!appReady) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const dotButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-dot]"),
    );

    const revealSection = (section: HTMLElement) => {
      if (section.dataset.revealed === "true") return;
      section.dataset.revealed = "true";
      if (reducedMotion) return;

      section
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((element, index) => {
          const delay = Math.min(index, 5) * 90;
          element.classList.add("go");
          element.style.transitionDelay = `${delay}ms`;
          window.requestAnimationFrame(() => element.classList.remove("pre"));
          window.setTimeout(() => {
            element.style.transition = "none";
            element.style.transitionDelay = "0ms";
            element.classList.remove("pre");
            element.style.opacity = "1";
            element.style.transform = "none";
          }, 900 + delay);
        });
    };

    if (!reducedMotion) {
      document
        .querySelectorAll(".reveal")
        .forEach((element) => element.classList.add("pre"));
    }

    const syncActiveSection = () => {
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionElements.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(
          rect.top + rect.height / 2 - viewportHeight / 2,
        );
        if (distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      });

      currentRef.current = best;
      setActiveSection(best);
    };

    const revealVisibleSections = () => {
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      sectionElements.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (
          rect.top < viewportHeight * 0.85 &&
          rect.bottom > viewportHeight * 0.15
        )
          revealSection(section);
      });
      syncActiveSection();
    };

    const goTo = (index: number) => {
      const next = Math.max(0, Math.min(sectionElements.length - 1, index));
      if (next === currentRef.current && lockRef.current) return;
      currentRef.current = next;
      lockRef.current = true;
      revealSection(sectionElements[next]);
      setActiveSection(next);
      window.scrollTo({
        top: sectionElements[next].offsetTop,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      window.setTimeout(() => {
        lockRef.current = false;
      }, 760);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (lockRef.current) return;
      if (event.deltaY > 8) goTo(currentRef.current + 1);
      if (event.deltaY < -8) goTo(currentRef.current - 1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goTo(currentRef.current + 1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goTo(currentRef.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(sectionElements.length - 1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartRef.current === null || lockRef.current) return;
      const distance =
        touchStartRef.current -
        (event.changedTouches[0]?.clientY ?? touchStartRef.current);
      if (Math.abs(distance) > 40)
        goTo(currentRef.current + (distance > 0 ? 1 : -1));
      touchStartRef.current = null;
    };

    const onResize = () => {
      syncActiveSection();
      window.scrollTo({
        top: sectionElements[currentRef.current]?.offsetTop ?? 0,
      });
      revealVisibleSections();
    };

    const onScroll = () => {
      setCueHidden(window.scrollY > 40);
      revealVisibleSections();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onDotClick = (event: Event) => {
      const index = Number(
        (event.currentTarget as HTMLButtonElement).dataset.index ?? "0",
      );
      goTo(index);
    };

    dotButtons.forEach((button) =>
      button.addEventListener("click", onDotClick),
    );

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting)
              revealSection(entry.target as HTMLElement);
          });
          syncActiveSection();
        },
        { threshold: [0, 0.2, 0.6] },
      );
      sectionElements.forEach((section) => observer?.observe(section));
    }

    revealVisibleSections();
    const firstFallback = window.setTimeout(revealVisibleSections, 200);
    const secondFallback = window.setTimeout(revealVisibleSections, 800);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      dotButtons.forEach((button) =>
        button.removeEventListener("click", onDotClick),
      );
      observer?.disconnect();
      window.clearTimeout(firstFallback);
      window.clearTimeout(secondFallback);
    };
  }, [appReady, sectionIds]);

  useEffect(() => {
    if (!normalizedInvitationCode) {
      setInvitees([]);
      setRsvps({});
      setInvitationError("");
      setConfirmed(false);
      return;
    }

    const controller = new AbortController();

    setInvitationLoading(true);
    setInvitationError("");
    setRsvpError("");
    setConfirmed(false);

    fetch(
      `${API_BASE_URL}/api/invitations/${encodeURIComponent(
        normalizedInvitationCode,
      )}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const fallbackMessage = `Invitation code "${normalizedInvitationCode}" was not found.`;
          const errorBody = (await response
            .json()
            .catch(() => undefined)) as { message?: string } | undefined;
          throw new Error(errorBody?.message ?? fallbackMessage);
        }

        return response.json() as Promise<InvitationResponse>;
      })
      .then((invitation) => {
        const fetchedInvitees = invitation.invitees ?? [];
        setInvitees(fetchedInvitees);
        setRsvps(
          Object.fromEntries(
            fetchedInvitees.map((invitee) => [
              invitee.id,
              invitee.status ?? "pending",
            ]),
          ),
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setInvitees([]);
        setRsvps({});
        setInvitationError(
          error instanceof Error
            ? error.message
            : "Unable to load this invitation.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setInvitationLoading(false);
      });

    return () => controller.abort();
  }, [normalizedInvitationCode]);

  const selectRsvp = (inviteeId: string, value: RsvpStatus) => {
    setConfirmed(false);
    setRsvpError("");
    setRsvps((current) => ({ ...current, [inviteeId]: value }));
  };

  const submitRsvps = async () => {
    if (!normalizedInvitationCode || invitees.length === 0) return;

    setSubmittingRsvp(true);
    setConfirmed(false);
    setRsvpError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/${encodeURIComponent(
          normalizedInvitationCode,
        )}/rsvp`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitees: invitees.map((invitee) => ({
              inviteeId: invitee.id,
              status: rsvps[invitee.id] ?? "pending",
            })),
          }),
        },
      );

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => undefined)) as
          | { message?: string }
          | undefined;
        throw new Error(errorBody?.message ?? "Unable to submit your RSVP.");
      }

      const updatedInvitation =
        (await response.json()) as InvitationResponse;
      const updatedInvitees = updatedInvitation.invitees ?? invitees;
      setInvitees(updatedInvitees);
      setRsvps(
        Object.fromEntries(
          updatedInvitees.map((invitee) => [
            invitee.id,
            invitee.status ?? "pending",
          ]),
        ),
      );
      setConfirmed(true);
    } catch (error) {
      setRsvpError(
        error instanceof Error ? error.message : "Unable to submit your RSVP.",
      );
    } finally {
      setSubmittingRsvp(false);
    }
  };

  return (
    <>
      <div
        className="bg-fallback fixed inset-0 z-0"
        style={{ backgroundColor: activeChromeColor }}
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <Image
            key={slide}
            src={slide}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-[center_30%] transition-opacity duration-[1600ms] ease-in-out ${
              activeSlide === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(44,28,18,0.52)_0%,rgba(48,30,20,0.40)_40%,rgba(40,24,16,0.58)_100%)] before:absolute before:inset-0 before:bg-[radial-gradient(130%_100%_at_50%_0%,rgba(58,38,24,0.20),transparent_45%)] after:absolute after:inset-0 after:bg-[radial-gradient(120%_120%_at_50%_120%,rgba(40,24,14,0.65),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] shadow-[inset_0_0_220px_40px_rgba(30,18,10,0.55)]"
        aria-hidden="true"
      />

      <main className="relative z-[2]">
        <section
          id={sectionIds[0]}
          className="relative flex min-h-svh flex-col items-center justify-center px-7 pb-[120px] pt-24 text-center"
          data-screen-label="01 Welcome"
        >
          <div className="w-full max-w-[430px]">
            <h1 className="reveal text-shadow-wedding font-script my-[0.12em] pb-[0.08em] text-[clamp(58px,16vw,88px)] leading-[1.08] text-[var(--ink)]">
              Joe &amp; Elissa
            </h1>
            <p className="reveal text-shadow-wedding font-serif-wedding text-[clamp(22px,6vw,30px)] italic leading-tight text-(--ink)">
              Are getting married!
            </p>
            <div className="wedding-rule reveal" />
            <p className="reveal text-shadow-wedding text-[15px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Sunday · August 16 · 2026
            </p>
            <div className="reveal mt-[34px] flex justify-center gap-3.5">
              {[
                ["Days", countdown.days],
                ["Hours", countdown.hours],
                ["Mins", countdown.mins],
                ["Secs", countdown.secs],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-w-[62px] flex-col items-center"
                >
                  <span className="text-shadow-wedding [font-variant-numeric:tabular-nums] text-[clamp(40px,11vw,52px)] font-medium leading-none text-[var(--ink)]">
                    {value}
                  </span>
                  <span className="mt-[9px] text-[11px] uppercase tracking-[0.26em] text-[var(--ink-soft)]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            className={`text-shadow-wedding absolute bottom-[46px] left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 text-[var(--ink-soft)] transition-opacity duration-500 ${cueHidden ? "opacity-0" : "opacity-100"}`}
            type="button"
            onClick={() =>
              document
                .getElementById(sectionIds[1])
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span className="text-[13px] uppercase tracking-[0.3em]">
              Scroll
            </span>
            <svg
              className="animate-bob"
              width="22"
              height="13"
              viewBox="0 0 22 13"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l10 10L21 1"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </section>

        <section
          id={sectionIds[1]}
          className="flex min-h-svh flex-col items-center justify-center px-7 pb-[120px] pt-24 text-center"
          data-screen-label="02 Invitation"
        >
          <div className="w-full max-w-[430px]">
            <p className="reveal text-shadow-wedding text-[clamp(19px,5.2vw,22px)] italic leading-[1.7] text-[var(--ink)]">
              &quot;So they are no longer two, but one flesh. Therefore what God
              has joined together, let no one separate.&quot;
            </p>
            <p className="reveal text-shadow-wedding mt-2.5 text-[15px] tracking-[0.16em] text-[var(--ink-soft)]">
              — Matthew 19:6 —
            </p>
            <div className="wedding-rule reveal" />
            <p className="reveal text-shadow-wedding font-script text-[clamp(42px,11vw,58px)] leading-[1.05] text-(--ink)">
              Joe Sawaya 
              <br />
              &amp; 
              <br />
              Elissa Haddad
            </p>
            <p className="reveal text-shadow-wedding text-[clamp(18px,4.8vw,21px)] font-semibold leading-[1.75] text-[var(--ink)]">
              Together with their families
            </p>
            <p className="reveal text-shadow-wedding text-[clamp(18px,4.8vw,21px)] leading-[1.75] text-[var(--ink)]">
              Joyfully invite you to celebrate with them <br /> Their Big Day.
            </p>
            <p className="reveal text-shadow-wedding text-[clamp(18px,4.8vw,21px)] leading-[1.75] text-[var(--ink)]">
              Sunday, 16 August 2026
            </p>
          </div>
        </section>

        <section
          id={sectionIds[2]}
          className="flex min-h-svh flex-col items-center justify-center px-7 py-12 text-center min-[390px]:pb-[120px] min-[390px]:pt-24 max-[380px]:px-5 max-[380px]:py-8 max-[380px]:min-h-dvh"
          data-screen-label="03 Ceremony"
        >
          <div className="flex w-full max-w-[430px] flex-col items-center">
            <h2 className="reveal text-shadow-wedding font-script text-[clamp(42px,12vw,64px)] leading-[1.04] text-(--ink)">
              Wedding Ceremony
            </h2>
            <div className="wedding-rule reveal my-4 max-[380px]:my-3" />
            <CalendarIcon className="reveal mx-auto block h-9 w-9 text-(--ink) drop-shadow-[0_2px_8px_rgba(30,18,10,0.45)] min-[390px]:h-10 min-[390px]:w-10" />
            <p className="reveal text-shadow-wedding mt-1 text-[clamp(17px,4.6vw,21px)] leading-[1.55] tracking-[0.04em] text-(--ink) min-[390px]:mt-1.5 min-[390px]:leading-[1.75]">
              August 16 · 5:30 PM
            </p>
            <LocationIcon className="reveal mx-auto mt-5 block h-10 w-9 text-(--ink) drop-shadow-[0_2px_8px_rgba(30,18,10,0.45)] min-[390px]:mt-[30px] min-[390px]:h-11 min-[390px]:w-10" />
            <p className="reveal text-shadow-wedding mt-1 text-[clamp(17px,4.6vw,21px)] font-semibold leading-[1.55] text-(--ink) min-[390px]:leading-[1.75]">
              St. Mary Greek Melkite
            </p>
            <p className="reveal text-shadow-wedding text-[clamp(17px,4.6vw,21px)] font-semibold leading-[1.55] text-(--ink) min-[390px]:leading-[1.75]">
              Saydet Al Intikal Church
            </p>
            <p className="reveal text-shadow-wedding text-[clamp(17px,4.6vw,21px)] leading-[1.55] text-(--ink) min-[390px]:leading-[1.75]">
              Achrafieh
            </p>
            <ButtonLink
              className="reveal mt-4 max-[380px]:px-5 max-[380px]:py-[11px] max-[380px]:text-sm min-[390px]:mt-[22px]"
              href="https://maps.app.goo.gl/RJ5sp6SmUA84HkZ27?g_st=iw"
            >
              Church Location
            </ButtonLink>
            <div className="wedding-rule reveal my-4 max-[380px]:my-3" />
            <p className="reveal text-shadow-wedding text-[clamp(17px,4.6vw,21px)] italic leading-[1.55] text-(--ink-soft) min-[390px]:leading-[1.75]">
              Followed by Reception &amp; Dinner
            </p>
            <p className="reveal text-shadow-wedding mt-2.5 text-[clamp(17px,4.6vw,21px)] font-semibold leading-[1.55] text-(--ink) min-[390px]:mt-3.5 min-[390px]:leading-[1.75]">
              Jardin De Stone
            </p>
            <ButtonLink
              className="reveal mt-4 max-[380px]:px-5 max-[380px]:py-[11px] max-[380px]:text-sm min-[390px]:mt-[18px]"
              href="https://maps.app.goo.gl/xQmbzGiBLydWD1DK9?g_st=iw"
            >
              Venue Location
            </ButtonLink>
          </div>
        </section>

        <section
          id={sectionIds[3]}
          className="flex min-h-svh flex-col items-center justify-center px-7 py-12 text-center min-[390px]:pb-[120px] min-[390px]:pt-24 max-[380px]:px-5 max-[380px]:py-8 max-[380px]:min-h-dvh"
          data-screen-label="04 Registry"
        >
          <div className="flex w-full max-w-[430px] flex-col items-center">
            <h2 className="reveal text-shadow-wedding font-script text-[clamp(42px,12vw,64px)] leading-[1.04] text-(--ink)">
              Gift Registry
            </h2>
            <div className="wedding-rule reveal my-4 max-[380px]:my-3" />
            <div className="reveal relative w-full overflow-hidden rounded-[3px] border border-(--gold-line) bg-[rgba(76,49,33,0.42)] px-5 py-6 shadow-[0_16px_48px_rgba(24,14,8,0.3)] backdrop-blur-[2px] before:pointer-events-none before:absolute before:inset-[6px] before:border before:border-[rgba(252,246,238,0.16)] min-[390px]:px-6 min-[390px]:py-7 max-[380px]:px-4 max-[380px]:py-5">
              <p className="relative text-shadow-wedding text-[clamp(17px,4.6vw,21px)] italic leading-[1.55] text-(--ink) min-[390px]:leading-[1.75]">
                Your presence is enough of a present to us!
                <br />
                For those who desire, a registry is available at:
              </p>
              <div className="wedding-rule relative my-4 min-[390px]:my-5" />
              <div className="relative text-shadow-wedding">
                <div className="mb-1.5 text-[clamp(19px,5vw,22px)] font-semibold tracking-[0.06em] text-(--ink) min-[390px]:mb-2">
                  UAE Emirates NBD
                </div>
                <p className="text-[clamp(15px,4vw,17px)] leading-7 tracking-[0.04em] text-(--ink) min-[390px]:leading-8">
                  Joe Antoine Sawaya
                </p>
                <p className="text-[clamp(15px,4vw,17px)] leading-7 tracking-[0.04em] text-(--ink) min-[390px]:leading-8">
                  Ac #0125846129002
                </p>
                <p className="text-[clamp(15px,4vw,17px)] leading-7 tracking-[0.04em] text-(--ink) min-[390px]:leading-8">
                  IBAN AE10 0260 0001 2584 6129 002
                </p>
              </div>
              <div className="wedding-diamond relative my-5 min-[390px]:my-6" />
              <div className="relative text-shadow-wedding">
                <div className="mb-1.5 text-[clamp(19px,5vw,22px)] font-semibold tracking-[0.06em] text-(--ink) min-[390px]:mb-2">
                  Whish Money
                </div>
                <p className="whitespace-pre-line text-[clamp(15px,4vw,17px)] leading-7 tracking-[0.04em] text-(--ink) min-[390px]:leading-8">
                  Account ID: 10218001-03{`\n`}Phone number: +971 558951417
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id={sectionIds[4]}
          className="flex min-h-svh flex-col items-center justify-center px-7 pb-[120px] pt-24 text-center"
          data-screen-label="05 RSVP"
        >
          <div className="w-full max-w-[430px]">
            <h2 className="reveal text-shadow-wedding font-script text-[clamp(46px,13vw,64px)] leading-[1.04] text-[var(--ink)]">
              Kindly RSVP
            </h2>
            <p className="reveal text-shadow-wedding mt-1.5 text-[15px] tracking-[0.14em] text-[var(--ink-soft)]">
              Please confirm by July 1, 2026
            </p>
            <div className="wedding-rule reveal" />
            <p className="reveal text-shadow-wedding my-1.5 mb-[18px] text-[17px] tracking-[0.04em] text-[var(--ink-soft)]">
              Number of invitees:{" "}
              <b className="font-semibold text-[var(--ink)]">
                {invitees.length}
              </b>
            </p>
            {invitationLoading ? (
              <p className="reveal text-shadow-wedding text-[17px] italic text-[var(--ink-soft)]">
                Loading your invitation...
              </p>
            ) : invitationError ? (
              <p className="reveal text-shadow-wedding text-[17px] italic text-[var(--ink-soft)]">
                {invitationError}
              </p>
            ) : invitees.length > 0 ? (
              <>
                <div className="reveal space-y-3">
                  {invitees.map((invitee) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between gap-3 border-y border-[rgba(252,246,238,0.16)] py-3 text-left"
                    >
                      <span className="text-shadow-wedding text-[19px] text-[var(--ink)]">
                        {invitee.fullName ?? "Guest"}
                      </span>
                      <div className="flex gap-2">
                        <RsvpButton
                          label="Accept"
                          variant="accept"
                          active={rsvps[invitee.id] === "accepted"}
                          onClick={() => selectRsvp(invitee.id, "accepted")}
                        />
                        <RsvpButton
                          label="Decline"
                          variant="decline"
                          active={rsvps[invitee.id] === "rejected"}
                          onClick={() => selectRsvp(invitee.id, "rejected")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="reveal mt-[30px] inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[2px] border border-[var(--gold-line)] bg-white/[0.04] px-[26px] py-[13px] font-serif-wedding text-base uppercase tracking-[0.12em] text-[var(--ink)] transition duration-300 hover:border-[var(--ink)] hover:bg-white/[0.14] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={submitRsvps}
                  disabled={submittingRsvp}
                >
                  {submittingRsvp ? "Confirming..." : "Press to Confirm"}
                </button>
                {rsvpError ? (
                  <p className="text-shadow-wedding mt-5 min-h-6 text-lg italic text-[var(--ink-soft)]">
                    {rsvpError}
                  </p>
                ) : (
                  <p
                    className={`text-shadow-wedding mt-5 min-h-6 text-lg italic text-[var(--gold)] transition-opacity duration-500 ${confirmed ? "opacity-100" : "opacity-0"}`}
                  >
                    Thank you. Your response has been noted ♡
                  </p>
                )}
              </>
            ) : (
              <p className="reveal text-shadow-wedding text-[17px] italic text-[var(--ink-soft)]">
                No invitation code was provided.
              </p>
            )}
          </div>
        </section>

        <section
          id={sectionIds[5]}
          className="flex min-h-svh flex-col items-center justify-center px-7 pb-[120px] pt-24 text-center"
          data-screen-label="06 Together"
        >
          <div className="flex w-full max-w-[430px] flex-col items-center">
            <h2 className="reveal text-shadow-wedding font-script text-[clamp(46px,13vw,62px)] leading-[1.04] text-[var(--ink)]">
              See you there!
            </h2>
          </div>
        </section>
      </main>

      <nav
        className="fixed right-[18px] top-1/2 z-30 flex -translate-y-1/2 flex-col gap-[13px]"
        aria-label="Invitation sections"
      >
        {sections.map((section, index) => (
          <button
            key={section}
            data-dot
            data-index={index}
            className={`h-[9px] w-[9px] cursor-pointer rounded-full border p-0 transition duration-300 ${
              activeSection === index
                ? "scale-125 border-[var(--gold)] bg-[var(--gold)]"
                : "border-[rgba(252,246,238,0.7)] bg-transparent"
            }`}
            type="button"
            aria-label={`Go to section ${index + 1}: ${section}`}
          />
        ))}
      </nav>
    </>
  );
}
