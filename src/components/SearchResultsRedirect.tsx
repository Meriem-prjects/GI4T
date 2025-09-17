import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const SearchResultsRedirect = () => {
  const [searchParams] = useSearchParams();
  
  // Get query parameter to preserve it in the redirect
  const query = searchParams.get('q');
  const redirectUrl = query 
    ? `/observatoire/search-results?q=${query}` 
    : '/observatoire/search-results';

  return <Navigate to={redirectUrl} replace />;
};

export default SearchResultsRedirect;