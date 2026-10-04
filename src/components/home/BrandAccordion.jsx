import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const DEFAULT_BRANDS = [];

export default function BrandAccordion({
  items = DEFAULT_BRANDS,
  defaultIndex = 0,
  height = 180,
  gap = 8,
  radius = 12,
  expandRatio = 0.25,
  duration = 0.5,
  ease = 'power3.out',
  className = '',
  brandClassName = '',
}) {
  const panelRefs = useRef([]);
  const logoRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);

  const count = items.length;
  const [active, setActive] = useState(
    Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0))
  );

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const applyLayout = useCallback(
    (animate) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const logo = logoRefs.current[i];

        tl.to(
          panel,
          { flexGrow: isActive ? grow : 1, duration: dur, ease },
          0
        );

        if (logo) {
          tl.to(
            logo,
            {
              opacity: isActive ? 1 : 0.7,
              scale: isActive ? 1 : 0.6,
              duration: dur,
              ease,
            },
            0
          );
        }
      });

      tlRef.current = tl;
    },
    [active, count, expandRatio, duration, ease, prefersReduced]
  );

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i) => setActive(i);
  const handleFocus = (i) => setActive(i);

  const handleClick = (i, e) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <>
      {/* MOBILE — Square logo cards, no text. */}
      <div
        className={`
          xl:hidden flex flex-row overflow-x-auto snap-x snap-proximity
          scrollbar-none [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
          ${className}
        `}
        style={{ gap: `${gap}px` }}
        role="list"
        aria-label="Brand list"
      >
        {items.map((item) => (
          <a
            key={item.name}
            href={item.link}
            className="group shrink-0 snap-start w-24 h-24 sm:h-28 sm:min-w-24 sm:max-w-40 sm:flex-1 rounded-xl transition-colors flex items-center justify-center p-4 no-underline outline-none focus-visible:ring-2 focus-visible:ring-black bg-transparent"
            aria-label={item.name}
            role="listitem"
          >
            <LogoCrossFade item={item} />
          </a>
        ))}
      </div>

      {/* DESKTOP — logos in both states, scaling on activation. */}
      <div
        className={`
          hidden xl:flex flex-row w-full
          max-xl:overflow-x-auto max-xl:snap-x max-xl:snap-proximity
          max-xl:scrollbar-none max-xl:[-ms-overflow-style:none]
          max-xl:[&::-webkit-scrollbar]:hidden
          ${className}
        `}
        style={{ gap: `${gap}px`, height: `${height}px` }}
        role="list"
        aria-label="Brand accordion"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <a
              key={item.name}
              ref={(el) => (panelRefs.current[i] = el)}
              href={item.link}
              className={`
                group relative block min-w-0 min-h-0 flex-[1_1_0]
                max-xl:min-w-18 max-xl:shrink-0 max-xl:snap-start
                cursor-pointer overflow-hidden
                bg-transparent
                transition-colors no-underline outline-none
                focus-visible:ring-2 focus-visible:ring-black
                ${brandClassName}
              `}
              style={{
                borderRadius: `${radius}px`,
                willChange: 'flex-grow',
              }}
              onClick={(e) => handleClick(i, e)}
              onMouseEnter={() => handleEnter(i)}
              onFocus={() => handleFocus(i)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              role="listitem"
              aria-label={item.name}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                ref={(el) => (logoRefs.current[i] = el)}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: isActive ? 1 : 0.7,
                  paddingLeft: isActive ? '12px' : '0',
                  paddingRight: isActive ? '12px' : '0',
                }}
              >
                <LogoCrossFade item={item} className="max-h-28" />
              </span>
            </a>
          );
        })}
      </div>
    </>
  );
}

/**
 * Renders the monochrome logo with the colored logo stacked on top.
 * The colored one fades in on hover (via the parent `group`) or when
 * the wrapper has opacity 1 (active panel). If no colored logo is
 * provided, only the monochrome one renders.
 */
function LogoCrossFade({ item, className = '' }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={item.logo}
        alt={item.name}
        draggable="false"
        className="absolute inset-0 w-full h-full object-contain select-none"
        style={{ WebkitUserDrag: 'none' }}
      />
      {item.coloredLogo && (
        <img
          src={item.coloredLogo}
          alt=""
          aria-hidden="true"
          draggable="false"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-contain select-none opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ WebkitUserDrag: 'none' }}
        />
      )}
    </div>
  );
}