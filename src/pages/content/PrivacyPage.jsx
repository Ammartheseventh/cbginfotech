import ContentPage from '../../components/layout/ContentPage';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function PrivacyPage() {
  usePageTitle('Privacy');

  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="Last updated: September 2026"
    >
      <p>
        CBG TechOnline Sdn Bhd ("we", "us", or "our") operates this website
        and the services offered through it. This page informs you of our
        policies regarding the collection, use, and disclosure of personal
        data when you use our site.
      </p>

      <h2>Information we collect</h2>
      <p>
        When you place an order or create an account, we collect information
        you provide directly:
      </p>
      <ul>
        <li>Name, email address, and phone number</li>
        <li>Shipping and billing address</li>
        <li>Order details, including items purchased and payment receipts</li>
      </ul>

      <h2>How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfil your orders</li>
        <li>Communicate with you about your order, including delivery and payment</li>
        <li>Provide customer support</li>
        <li>Comply with legal and regulatory obligations</li>
      </ul>

      <h2>Sharing your information</h2>
      <p>
        We do not sell, trade, or rent your personal information to third
        parties. We may share information with service providers who help
        us operate the site and fulfil orders — for example, courier
        companies — but only to the extent necessary to complete the
        service.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain your personal data for as long as your account is active,
        or as needed to provide services and comply with legal obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, or request deletion of your
        personal data. To exercise these rights, please{' '}
        <a href="/about/contact">contact us</a>.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this Privacy Policy, please reach out
        through our <a href="/about/contact">contact page</a>.
      </p>
    </ContentPage>
  );
}