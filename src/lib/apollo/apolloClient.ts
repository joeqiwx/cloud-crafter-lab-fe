import { useMemo } from "react";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
  console.log(
    "process.env.NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_ENV_VARIABLE
  );
  const isServer = typeof window === "undefined";
  const uri = isServer
    ? process.env.PRIVATE_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

  return new ApolloClient({
    ssrMode: isServer,
    link: new HttpLink({
      uri: uri,
      credentials: "same-origin",
    }),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null
) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  if (typeof window === "undefined") return _apolloClient;

  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: NormalizedCacheObject) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
