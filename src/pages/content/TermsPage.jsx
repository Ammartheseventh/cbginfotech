import ContentPage from '../../components/layout/ContentPage';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function TermsPage() {
  usePageTitle('Terms');

  return (
    <ContentPage
      title="Terms & Conditions"
      subtitle="Last updated: September 2026"
    >
      <p>
        These Terms & Conditions govern your use of the CBG InfoTech Sdn Bhd
        website and the services offered through it. By using this site,
        you agree to these terms.
      </p>

      <h2>Use of the site</h2>
      <p>
        You agree to use this site only for lawful purposes and in a manner
        that does not infringe the rights of, or restrict or inhibit the
        use of this site by, any third party.
      </p>

      <h2>Orders and payment</h2>
      <p>
        All orders are subject to acceptance and availability. Prices are
        listed in Malaysian Ringgit (RM) and are subject to change without
        notice. Payment must be completed via the methods shown at
        checkout, and a valid payment receipt must be uploaded for orders
        to be processed.
      </p>

      <h2>Delivery</h2>
      <p>
        Delivery timelines are estimates and may vary based on location and
        availability. Risk of loss passes to you upon delivery. For pickup
        orders, we will contact you to arrange a collection time.
      </p>

      <h2>Returns and refunds</h2>
      <p>
        Returns are governed by our <a href="/returns">Return Policy</a>.
        Please review it before placing an order.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site — including text, images, logos, and
        product photographs — is the property of CBG InfoTech Sdn Bhd or
        its content suppliers and is protected by copyright.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        CBG InfoTech Sdn Bhd will not be liable for any indirect,
        incidental, or consequential damages arising out of your use of the
        site or the services offered through it, to the fullest extent
        permitted by Malaysian law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Malaysia. Any disputes
        arising in connection with these terms shall be subject to the
        exclusive jurisdiction of the Malaysian courts.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We reserve the right to update these terms at any time. Continued
        use of the site after changes are posted constitutes acceptance of
        the revised terms.
      </p>
    </ContentPage>
  );
}