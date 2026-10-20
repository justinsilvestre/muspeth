import { useSearchParams } from "react-router";
import {
  type ConnectionFilter,
  parseConnectionFilter,
  writeConnectionFilter,
} from "../../shared/connectionFilter";

/** Reads the connection filter from the address, and replaces it there when it changes. */
export function useConnectionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const setFilter = (filter: ConnectionFilter) =>
    setSearchParams(writeConnectionFilter(searchParams, filter), { replace: true });
  return { filterResult: parseConnectionFilter(searchParams), setFilter };
}
