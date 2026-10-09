import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { Lang } from "@/lib/odf";

interface Crumb {
  label: string;
  to?: string;
}

// Fil d'Ariane de l'ODF : Accueil › Observatoire › … (suit le sens de la page).
export default function OdfBreadcrumb({ lang, items }: { lang: Lang; items: Crumb[] }) {
  const all: Crumb[] = [
    { label: lang === "ar" ? "الرئيسية" : "Accueil", to: "/" },
    { label: lang === "ar" ? "المرصد" : "Observatoire", to: "/observatoire" },
    ...items,
  ];
  return (
    <nav aria-label={lang === "ar" ? "مسار التصفّح" : "Fil d'Ariane"} className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <Fragment key={i}>
              <li className={last ? "max-w-[min(60ch,70vw)] truncate text-foreground" : undefined} aria-current={last ? "page" : undefined}>
                {c.to && !last ? (
                  <Link to={c.to} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  c.label
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="select-none">
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
