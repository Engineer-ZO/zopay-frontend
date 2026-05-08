export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Revenue Over Time</h3>
          <p className="text-gray-500 text-center py-8">Chart will appear here</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Transaction Volume</h3>
          <p className="text-gray-500 text-center py-8">Chart will appear here</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          <p className="text-gray-500 text-center py-8">Chart will appear here</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Success Rate</h3>
          <p className="text-gray-500 text-center py-8">Chart will appear here</p>
        </div>
      </div>
    </div>
  );
}
