import { prisma } from "@/lib/prisma";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default async function AdminDashboard() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Manage Properties</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 font-semibold text-gray-600">Property Name</th>
                <th className="p-4 font-semibold text-gray-600">City</th>
                <th className="p-4 font-semibold text-gray-600">Owner ID</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.city}</td>
                  <td className="p-4 text-gray-500 text-sm">{p.ownerId.slice(0,8)}...</td>
                  <td className="p-4">
                    {p.isVerified === 'VERIFIED' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded w-fit">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded w-fit">
                        <ShieldAlert size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {p.isVerified === 'PENDING' && (
                       <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
