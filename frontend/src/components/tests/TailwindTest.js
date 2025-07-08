// src/components/TailwindTest.jsx
export default function TailwindTest() {
  return (
    <div className="p-6 bg-pharmacy-primary text-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Tailwind is Ready!</h1>
      <p className="mt-2">Your pharmacy app styles are working.</p>
      <button className="mt-4 px-4 py-2 bg-pharmacy-accent rounded hover:bg-opacity-90">
        Test Button
      </button>
    </div>
  );
}