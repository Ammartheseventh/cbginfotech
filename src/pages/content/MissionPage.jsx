import ContentPage from '../../components/layout/ContentPage';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function MissionPage() {
  usePageTitle('Mission & Vision');

  return (
    <ContentPage title="Mission & Vision">
      <p>
        CBG TechOnline Sdn Bhd is a Malaysian IT equipment company specializing
        in the leasing and supply of computers, peripherals, and networking
        infrastructure for businesses of all sizes.
      </p>

      <p>
        We work with organizations across the Klang Valley and beyond to
        equip their teams with reliable hardware — without the capital
        outlay of outright purchase. Our leasing model gives businesses
        flexible access to current-generation equipment, with maintenance
        and replacement handled by us.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>
          <strong>Equipment leasing</strong> — laptops, desktops, monitors,
          and peripherals on flexible lease terms.
        </li>
        <li>
          <strong>Corporate supply</strong> — bulk hardware procurement for
          offices, schools, and institutions.
        </li>
        <li>
          <strong>Networking solutions</strong> — routers, switches, and
          access points for reliable workplace connectivity.
        </li>
        <li>
          <strong>Ongoing support</strong> — maintenance, replacement, and
          lifecycle management for all leased equipment.
        </li>
      </ul>

      <h2>Why we built this store</h2>
      <p>
        Historically, our business has been relationship-driven — we work
        directly with procurement teams to fulfil their hardware needs. This
        store is our first step into self-service ordering, giving customers
        a way to browse our catalog and place orders online.
      </p>
    </ContentPage>
  );
}