import {
  Link as RRLink,
  Navigate,
  useLocation,
  useNavigate as useRRNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type LinkProps = Omit<ComponentPropsWithoutRef<typeof RRLink>, "to"> & {
  to: string;
  search?: Record<string, string | number | boolean | undefined>;
};

function buildPath(to: string, search?: LinkProps["search"]) {
  if (!search) return to;
  const params = new URLSearchParams();
  Object.entries(search).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${to}?${qs}` : to;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, search, ...rest },
  ref,
) {
  return <RRLink ref={ref} to={buildPath(to, search)} {...rest} />;
});

interface NavigateOptions {
  to: string;
  search?: LinkProps["search"];
  replace?: boolean;
}

export function useNavigate() {
  const nav = useRRNavigate();
  return (opts: NavigateOptions) =>
    nav(buildPath(opts.to, opts.search), { replace: opts.replace });
}

interface RouterState {
  location: { pathname: string; search: string; hash: string };
}

export function useRouterState<T>({ select }: { select: (s: RouterState) => T }): T {
  const loc = useLocation();
  return select({ location: { pathname: loc.pathname, search: loc.search, hash: loc.hash } });
}

export { Navigate, useParams, useSearchParams, useLocation };
