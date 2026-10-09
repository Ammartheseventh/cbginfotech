import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import banner1 from '../../assets/banner/banner1.png';
import banner2 from '../../assets/banner/banner2.png';
import banner3 from '../../assets/banner/banner3.png';

const SLIDES = [
  { image: banner1, lead: 'Unbox What\u2019s', accent: 'Next.' },
  { image: banner2, lead: 'Browse What\u2019s', accent: 'Next.' },
  { image: banner3, lead: 'Your Next Upgrade,', accent: 'Delivered.' },
];

const ROTATE_MS = 4000;
const TRANSITION_MS = 700;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 pb-6 lg:pt-10 lg:pb-10">
      <div
        className="relative grid lg:grid-cols-12 gap-6 items-center"
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

            {/* Tablet-only scrim + overlay text */}
            <div className="hidden sm:block lg:hidden absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
            <div className="hidden sm:block lg:hidden absolute inset-x-0 bottom-0 p-6">
              <div className="max-w-md">
                <Headline index={index} onDark />
                <Cta onDark />
              </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 right-4 lg:bottom-5 lg:right-5 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/80 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TEXT */}
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-5 min-w-0">
          <div className="sm:hidden text-center">
            <Headline index={index} />
            <Cta />
          </div>
          <div className="hidden lg:block">
            <Headline index={index} stacked />
            <Cta />
          </div>
        </div>
      </div>
    </section>
  );
}

function Headline({ index, onDark = false, stacked = false }) {
  return (
    <h1
      className={`font-bold tracking-tight leading-[1.1] text-2xl sm:text-3xl xl:text-5xl ${
        onDark ? 'text-white' : 'text-gray-900'
      }`}
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
            <span className={stacked ? 'block' : 'inline'}>{slide.lead}</span>{' '}
            <span className={`text-brand ${stacked ? 'block' : 'inline'}`}>
              {slide.accent}
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}

function Cta({ onDark = false }) {
  return (
    <>
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