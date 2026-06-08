import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="mb-8 mt-6">
      <div className="flex items-center gap-3">
        {/* Login button for mobile */}
        <button className="rounded-xl border border-primary/40 bg-background px-4 py-2.5 text-sm font-semibold text-foreground md:hidden">
          {i18n.language === "ar" ? "تسجيل / تسجيل الدخول" : "Register / Login"}
        </button>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 rounded-full border-2 border-primary bg-background/50 px-4 py-2.5 transition-all focus-within:border-primary focus-within:bg-background"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={i18n.language === "ar" ? "ابحث عن تطبيقك" : "Search your app"}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            />
            <button
              type="submit"
              className="text-primary transition-colors hover:text-primary/80"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}