import { gql } from "@apollo/client";

export const GET_HELLO_WORLD_DATA_QUERY = gql`
  query HelloWorld {
    hello {
      text
    }
  }
`;
