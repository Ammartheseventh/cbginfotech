import { sanity } from './sanity';

export async function getPaymentDetails(method) {
  const doc = await sanity.fetch(
    `*[_type == 'paymentDetails' && method == $method][0] { label, type, instructions, bankName, accountName, accountNumber }`,
    { method }
  );
  return doc;
}