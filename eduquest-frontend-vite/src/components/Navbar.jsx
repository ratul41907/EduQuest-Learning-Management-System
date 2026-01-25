import { NavLink } from "react-router-dom";

function LinkItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <div className="font-bold">EduQuest</div>

        <nav className="flex gap-2">
          <LinkItem to="/" label="Home" />
          <LinkItem to="/courses" label="Courses" />
          <LinkItem to="/login" label="Login" />
          <LinkItem to="/register" label="Register" />
        </nav>
      </div>
    </header>
  );
}
