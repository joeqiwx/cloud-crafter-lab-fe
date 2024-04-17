import { GET_HELLO_WORLD_DATA_QUERY } from "@/graphql/queries/queries";
import { HelloworldQueryType } from "@/graphql/type";
import { useQuery } from "@apollo/client";
import * as React from "react";

const Test = () => {
  const { loading, error, data } = useQuery<HelloworldQueryType>(
    GET_HELLO_WORLD_DATA_QUERY
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <h1>{data?.hello.text}</h1>;
};

export default Test;
