import { Link } from 'react-router-dom';
import facebook from '../../assets/socials/facebook.svg';
import linkedin from '../../assets/socials/linkedin.svg';
import instagram from '../../assets/socials/instagram.svg';

const contentLinks = [
  { to: '/about/mission', label: 'Mission' },
  { to: '/about/contact', label: 'Contact' },
  { to: '/about/returns', label: 'Returns' },
  { to: '/about/privacy', label: 'Privacy' },
  { to: '/about/terms', label: 'Terms' },
];

const socials = [
  { name: 'Facebook', icon: facebook, href: 'https://www.facebook.com/CBGInfotech-329189844500886/' },
  { name: 'LinkedIn', icon: linkedin, href: 'https://www.linkedin.com/company/cbginfotech/' },
  { name: 'Instagram', icon: instagram, href: 'https://www.instagram.com/cbginfotech/' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: brand + tagline */}
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-gray-900">
              CBG TechOnline Sdn Bhd
            </p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              IT equipment leasing and supply for businesses across Malaysia.
            </p>
          </div>

          {/* Right: links in a flat row */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 md:pt-1">
            {contentLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-gray-600 hover:text-brand transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar: copyright + socials */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CBG TechOnline Sdn Bhd. All rights
            reserved.
          </p>

          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <img src={s.icon} alt="" className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}