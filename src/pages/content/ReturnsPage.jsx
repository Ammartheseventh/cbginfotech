import ContentPage from '../../components/layout/ContentPage';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function ReturnsPage() {
  usePageTitle('Returns');

  return (
    <ContentPage title="Return Policy">
      <p>
        We want you to be satisfied with your purchase. If something isn't
        right, our return policy below outlines how to return or exchange
        an item.
      </p>

      <h2>Return window</h2>
      <p>
        Returns are accepted within <strong>14 days</strong> of delivery,
        provided the item is in its original condition with all packaging
        and accessories included.
      </p>

      <h2>Eligibility</h2>
      <p>To be eligible for a return, the item must:</p>
      <ul>
        <li>Be unused and in the same condition as when you received it</li>
        <li>Be in the original packaging with all accessories</li>
        <li>Be accompanied by proof of purchase (order ID is sufficient)</li>
      </ul>
      <p>
        Certain items are non-returnable for hygiene or licensing reasons,
        including opened software, opened toner cartridges, and custom-
        configured equipment.
      </p>

      <h2>How to initiate a return</h2>
      <ol>
        <li>
          <a href="/about/contact">Contact us</a> with your order ID and the
          reason for the return.
        </li>
        <li>
          We'll review your request and, if approved, provide return
          instructions.
        </li>
        <li>
          Ship the item back to us using the method we specify. Return
          shipping is covered by us for defective items; for other
          returns, it's the customer's responsibility.
        </li>
      </ol>

      <h2>Refunds</h2>
      <p>
        Once we receive and inspect the returned item, we'll notify you of
        the outcome. Approved refunds will be processed within 5-7 business
        days to the original payment method.
      </p>

      <h2>Exchanges</h2>
      <p>
        If you'd like to exchange an item for a different one, please
        mention this when you contact us. Exchanges are subject to
        availability.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        If you received a damaged or incorrect item, please contact us
        within 48 hours of delivery. We'll arrange a replacement at no cost
        to you.
      </p>

      <h2>Questions</h2>
      <p>
        If anything is unclear, reach out through our{' '}
        <a href="/about/contact">contact page</a> and we'll help.
      </p>
    </ContentPage>
  );
}