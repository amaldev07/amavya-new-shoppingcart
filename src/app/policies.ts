export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  points?: string[];
}

export interface PolicyPage {
  path: string;
  title: string;
  summary: string;
  sections: PolicySection[];
}

export const POLICY_PAGES: PolicyPage[] = [
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    summary: 'How Amavya collects, uses, stores, and shares information when you shop with us.',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'When you place an order or contact us, we may collect your name, phone number, delivery address, order notes, and correspondence with us.',
          'Payment processing is handled by Razorpay. Amavya receives payment references and status information but does not collect or store your complete card, UPI PIN, or banking credentials.',
        ],
      },
      {
        heading: 'How we use your information',
        points: [
          'To process payments, confirm orders, arrange delivery, and provide customer support.',
          'To prevent fraud, resolve disputes, maintain business records, and comply with legal obligations.',
          'To improve the reliability and operation of our website and checkout.',
        ],
      },
      {
        heading: 'Service providers and disclosure',
        paragraphs: [
          'We share only the information needed with providers that support our store, including Razorpay for payments, delivery partners for fulfilment, Firebase and Render for application hosting and storage, and Cloudinary for product media. These providers process information under their own privacy terms.',
          'We may also disclose information when required by law, to protect customers or our business, or as part of a lawful business transfer.',
        ],
      },
      {
        heading: 'Storage and retention',
        paragraphs: [
          'The website uses local browser storage to remember cart items. Order and payment records are retained only for fulfilment, support, accounting, fraud prevention, and legal compliance, after which they may be deleted or anonymised.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You may ask us to access, correct, or delete personal information we hold about you, subject to records we must retain by law. Contact us using the details below.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'This store is not intended for children to make purchases without the involvement of a parent or legal guardian.',
        ],
      },
    ],
  },
  {
    path: '/terms-and-conditions',
    title: 'Terms and Conditions',
    summary: 'The terms that apply when you browse or purchase jewellery from Amavya.',
    sections: [
      {
        heading: 'Products and availability',
        paragraphs: [
          'We make reasonable efforts to present product descriptions, colours, prices, and availability accurately. Screen settings and photography may cause minor colour differences. Product availability can change before checkout is completed.',
        ],
      },
      {
        heading: 'Orders and payment',
        paragraphs: [
          'Prices are displayed in Indian rupees. Shipping charges are shown before payment. Payments are processed securely by Razorpay.',
          'An order is accepted after successful payment confirmation. We may cancel and refund an order if an item is unavailable, pricing is incorrect, payment cannot be verified, or the order appears fraudulent.',
        ],
      },
      {
        heading: 'Shipping, cancellation, and refunds',
        paragraphs: [
          'Shipping and delivery are governed by our Shipping and Delivery Policy. Cancellations, damaged items, returns, and refunds are governed by our Refund and Cancellation Policy.',
        ],
      },
      {
        heading: 'Product care',
        paragraphs: [
          'Anti-tarnish finishes last longer with appropriate care but are not permanent. Keep jewellery away from water, perfume, cosmetics, chemicals, and excessive moisture, and store pieces separately when not in use.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'You must not misuse the website, attempt unauthorised access, interfere with checkout, submit false information, or use Amavya content and product images without permission.',
        ],
      },
      {
        heading: 'Liability and governing law',
        paragraphs: [
          'To the extent permitted by law, Amavya is not responsible for indirect losses or delays outside our reasonable control. Nothing in these terms limits rights available to consumers under applicable law.',
          'These terms are governed by the laws of India. We encourage customers to contact us first so that concerns can be resolved promptly.',
        ],
      },
    ],
  },
  {
    path: '/refund-cancellation-policy',
    title: 'Refund and Cancellation Policy',
    summary: 'When an Amavya order can be cancelled, returned, replaced, or refunded.',
    sections: [
      {
        heading: 'Order cancellation',
        paragraphs: [
          'Contact us as soon as possible if you need to cancel an order. We can cancel and refund it if dispatch has not started. Once an order has been dispatched, it cannot be cancelled, but the damaged or incorrect item process below still applies.',
        ],
      },
      {
        heading: 'Damaged, defective, missing, or incorrect items',
        paragraphs: [
          'Contact us within 48 hours of delivery with your order details and clear photos of the item and packaging. An unpacking video, when available, can help us assess transit damage or missing contents quickly.',
          'If the claim is approved, we will offer a replacement where stock is available or a refund. Do not return an item until we provide return instructions and the approved return address.',
        ],
      },
      {
        heading: 'Return eligibility',
        paragraphs: [
          'For hygiene reasons, change-of-mind returns or exchanges are not accepted for jewellery unless required by applicable law. Approved returns must be unused, unworn, and sent with their original packaging and accessories.',
          'Damage caused by wear, improper storage, exposure to water or chemicals, or failure to follow product-care guidance is not treated as a manufacturing defect.',
        ],
      },
      {
        heading: 'Refund timing',
        paragraphs: [
          'Approved refunds are initiated to the original payment method within 5-7 business days after cancellation approval or inspection of a returned item. Razorpay or your bank may require additional time to show the credit in your account.',
          'Original shipping charges are refunded when the complete order is cancelled before dispatch or when we confirm that the delivered item was damaged, defective, missing, or incorrect.',
        ],
      },
    ],
  },
  {
    path: '/shipping-delivery-policy',
    title: 'Shipping and Delivery Policy',
    summary: 'Shipping charges, dispatch estimates, delivery, and what to do when a parcel is delayed.',
    sections: [
      {
        heading: 'Shipping coverage and charge',
        paragraphs: [
          'Amavya currently ships within India. A flat shipping charge of Rs. 45 applies to each order and is displayed in the cart before payment.',
        ],
      },
      {
        heading: 'Processing and delivery estimates',
        paragraphs: [
          'Orders are generally dispatched within 2-4 business days after payment confirmation. Delivery generally takes another 3-7 business days, depending on the destination, courier availability, public holidays, weather, and other circumstances outside our control.',
          'These are estimates rather than guaranteed delivery dates. We will contact you if we become aware of a significant delay.',
        ],
      },
      {
        heading: 'Delivery information',
        paragraphs: [
          'Please provide a complete address, correct PIN code, and reachable phone number during checkout. Customers may be responsible for additional shipping costs when a parcel is returned because the address was incorrect, delivery was repeatedly refused, or the recipient was unavailable.',
        ],
      },
      {
        heading: 'Tracking and delivery issues',
        paragraphs: [
          'Tracking information will be shared when available. If a parcel is marked delivered but has not been received, or appears lost or materially delayed, contact us promptly with your order details so we can raise the issue with the delivery partner.',
        ],
      },
    ],
  },
];

export function policyForPath(path: string): PolicyPage | null {
  const normalisedPath = path.length > 1 ? path.replace(/\/$/, '') : path;
  return POLICY_PAGES.find((policy) => policy.path === normalisedPath) ?? null;
}
