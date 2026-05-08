export default function MTNMomoPage() {
  return (
    <div>
      <h1>MTN Mobile Money Integration</h1>
      <p>
        Learn how to integrate MTN Mobile Money payments into your application using the ZitoPay API.
      </p>
      <h2>Initiate Payment</h2>
      <p>
        Use the payment initiation endpoint to start a Mobile Money transaction.
      </p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>
          {`POST /api/v1/payments/mtn-momo
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "amount": 1000,
  "currency": "XOF",
  "phoneNumber": "+225123456789",
  "description": "Payment for order #123"
}`}
        </code>
      </pre>
    </div>
  );
}
