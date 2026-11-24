import ContentPage from '../../components/layout/ContentPage';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function ContactPage() {
  usePageTitle('Contact');

  return (
    <ContentPage title="Contact Us">
      <p>
        Whether you have a question about a product, need help with an
        order, or want to discuss a leasing arrangement, we're here to
        help.
      </p>

      <h2>Head office</h2>
      <p>
        CBG TechOnline Sdn Bhd
        <br />
        27, Jalan Pendidik
        <br />
        U1/31, Hicom-glenmarie Industrial Park
        <br />
        40150 Shah Alam, Selangor
        <br />
        Malaysia
      </p>

      <h2>Phone</h2>
      <p>
        <a href="tel:+60355699951">03-5569 9951</a>
      </p>

      <h2>Email</h2>
      <p>
        Sales: <a href="mailto:sales@cbgtechonline.com.my">sales@cbgtechonline.com.my</a>
        <br />
        Support: <a href="mailto:helpdesk@cbgtechonline.com.my">helpdesk@cbgtechonline.com.my</a>
      </p>

      <h2>Business hours</h2>
      <p>
        Monday to Friday, 9:00 AM – 6:00 PM (MYT)
        <br />
        Closed on weekends and public holidays.
      </p>

      <h2>Response times</h2>
      <p>
        We aim to respond to all enquiries within one business day. For
        urgent order issues, please include your order ID in the subject
        line so we can route your message quickly.
      </p>
    </ContentPage>
  );
}