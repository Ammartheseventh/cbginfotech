import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import banner1 from '../../assets/banner/banner1.png';
import banner2 from '../../assets/banner/banner2.png';
import banner3 from '../../assets/banner/banner3.png';

const SLIDES = [
  {
    image: banner1,
    lead: 'Unbox What\u2019s',
    accent: 'Next.',
  },
  {
    image: banner2,
    lead: 'Browse What\u2019s',
    accent: 'Next.',
  },
  {
    image: banner3,
    lead: 'Your Next Upgrade,',
    accent: 'Delivered.',
  },
];

const ROTATE_MS = 4000;
const TRANSITION_MS = 700;
const REFERENCE_SIZE = 100;

const MOBILE_MIN = 14;
const MOBILE_MAX = 40;
const DESKTOP_MIN = 36;
const DESKTOP_MAX = 72;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, paused]);

  const goTo = (i) => setIndex(i);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 pb-6 lg:pt-10 lg:pb-10">
      <div
        className="relative grid lg:grid-cols-12 gap-6 lg:gap-10 items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* IMAGE CAROUSEL */}
        <div className="relative order-1 lg:order-2 lg:col-span-7">
          <div className="relative w-full aspect-3/2 sm:aspect-16/10 overflow-hidden rounded-2xl bg-gray-100">
            <div
              className="absolute inset-0 flex transition-transform ease-out"
              style={{
                transform: `translateX(-${index * 100}%)`,
                transitionDuration: `${TRANSITION_MS}ms`,
              }}
            >
              {SLIDES.map((slide, i) => (
                <div key={i} className="relative w-full h-full shrink-0">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-full object-cover object-right"
                  />
                </div>
              ))}
            </div>

            {/* Tablet-only scrim + overlay text (sm to lg) */}
            <div className="hidden sm:block lg:hidden absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
            <div className="hidden sm:block lg:hidden absolute inset-x-0 bottom-0 p-6">
              <div className="max-w-md">
                <HeadlineAndCta index={index} onDark layout="single" />
              </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 right-4 lg:bottom-5 lg:right-5 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TEXT — mobile and desktop, each with its own layout */}
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-5 lg:pr-4">
          <div className="sm:hidden text-center">
            <HeadlineAndCta index={index} layout="single" />
          </div>
          <div className="hidden lg:block">
            <HeadlineAndCta index={index} layout="stacked" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeadlineAndCta({ index, onDark = false, layout = 'single' }) {
  const containerRef = useRef(null);
  const measureRefs = useRef([]);
  const [fontSize, setFontSize] = useState(null);

  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;

      const available = container.clientWidth;
      if (available === 0) return;

      let widest = 0;
      measureRefs.current.forEach((el, i) => {
        if (!el) return;
        const slide = SLIDES[i];
        const text =
          layout === 'stacked'
            ? slide.lead
            : `${slide.lead} ${slide.accent}`;
        el.textContent = text;
        el.style.fontSize = `${REFERENCE_SIZE}px`;
        el.style.whiteSpace = 'nowrap';
        const w = el.getBoundingClientRect().width;
        if (w > widest) widest = w;
      });

      if (widest === 0) return;

      const fitSize = (available / widest) * REFERENCE_SIZE;

      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      const min = isMobile ? MOBILE_MIN : DESKTOP_MIN;
      const max = isMobile ? MOBILE_MAX : DESKTOP_MAX;
      const clamped = Math.max(min, Math.min(max, fitSize));

      setFontSize(clamped);
    };

    compute();

    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', compute);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [layout]);

  return (
    <>
      <div ref={containerRef} className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-0"
          style={{ height: 0, overflow: 'hidden' }}
        >
          {SLIDES.map((_, i) => (
            <span
              key={i}
              ref={(el) => (measureRefs.current[i] = el)}
              className="inline-block font-bold tracking-tight"
            />
          ))}
        </div>

        <h1
          className={`font-bold tracking-tight leading-[1.1] ${
            onDark ? 'text-white' : 'text-gray-900'
          }`}
          style={
            fontSize
              ? { fontSize: `${fontSize}px`, lineHeight: 1.1 }
              : { visibility: 'hidden' }
          }
        >
          <span className="relative block">
            {SLIDES.map((slide, i) => (
              <span
                key={i}
                className={`block transition-opacity duration-500 ${
                  i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } ${i === index ? '' : 'absolute inset-0'}`}
                aria-hidden={i !== index}
              >
                {layout === 'stacked' ? (
                  <>
                    <span className="block whitespace-nowrap">{slide.lead}</span>
                    <span className="block whitespace-nowrap text-brand">
                      {slide.accent}
                    </span>
                  </>
                ) : (
                  <span className="block whitespace-nowrap">
                    {slide.lead}{' '}
                    <span className="text-brand">{slide.accent}</span>
                  </span>
                )}
              </span>
            ))}
          </span>
        </h1>
      </div>

      <p
        className={`mt-4 text-base lg:text-lg max-w-md mx-auto lg:mx-0 ${
          onDark ? 'text-white/85' : 'text-gray-600'
        }`}
      >
        Shop laptops and computers—all in one place.
      </p>

      <Link
        to="/products"
        className="inline-block mt-6 px-7 py-3 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors"
      >
        Shop Now
      </Link>
    </>
  );
}