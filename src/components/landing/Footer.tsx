export const Footer = () => {
  return (
    <footer className="bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-primary mb-4">DayLy</h3>
        <p className="text-gray-600">
          Transform your goals into achievable daily tasks
        </p>
        <div className="mt-8 text-sm text-gray-500">
          © {new Date().getFullYear()} DayLy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};