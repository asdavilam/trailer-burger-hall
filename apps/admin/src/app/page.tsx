import { Protein } from '@trailer/shared';

export default function AdminPage() {
  const testProtein: Protein = {
    id: 'test-1',
    name: 'Proteína Admin (Desde Shared)',
    price_base: 100,
    price_double: 150,
    price_light: 90,
    available: true
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Panel de Administración 🛡️</h1>
      <div className="p-6 border rounded shadow-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Prueba de Conexión:</h2>
        <pre className="bg-black text-white p-4 rounded">
          {JSON.stringify(testProtein, null, 2)}
        </pre>
      </div>
    </div>
  );
}