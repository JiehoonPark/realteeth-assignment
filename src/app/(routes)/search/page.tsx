import { notFound, redirect } from "next/navigation";

import { getLocationMatches } from "@/features/search";

type SearchPageProps = {
  searchParams?: {
    keyword?: string | string[];
  };
};

function getKeyword(searchParams: SearchPageProps["searchParams"]) {
  if (!searchParams?.keyword) return "";
  if (Array.isArray(searchParams.keyword)) {
    return searchParams.keyword[0] ?? "";
  }
  return searchParams.keyword;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const keyword = getKeyword(searchParams).trim();
  if (!keyword) {
    notFound();
  }

  const results = getLocationMatches(keyword);
  if (results.length === 0) {
    notFound();
  }

  redirect(`/locations/${encodeURIComponent(results[0].id)}`);
}
