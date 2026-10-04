import { useState } from 'react';

export default function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return <div className="aspect-square bg-gray-100 rounded-lg" />;
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                i === active
                  ? 'border-black'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}