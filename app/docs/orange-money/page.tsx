export default function OrangeMoneyPage() {
  return (
    <div>
      <h1>Orange Money Integration</h1>
      <p>
        Learn how to integrate Orange Money payments into your application using the ZitoPay API.
      </p>
      <h2>Initiate Payment</h2>
      <p>
        Use the payment initiation endpoint to start an Orange Money transaction.
      </p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>
          {`POST /api/v1/payments/orange-money
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "amount": 1000,
  "currency": "XOF",
  "phoneNumber": "+225987654321",
  "description": "Payment for order #123"
}`}
        </code>
      </pre>
    </div>
  );
}
