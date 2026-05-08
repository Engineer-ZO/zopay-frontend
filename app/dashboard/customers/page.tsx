export default function CustomersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <input type="search" placeholder="Search customers..." className="w-full border rounded-lg px-4 py-2" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Total Transactions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center p-8 text-gray-500">
                No customers found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
