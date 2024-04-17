import { GET_HELLO_WORLD_DATA_QUERY } from "@/graphql/queries/queries";
import { HelloworldQueryType } from "@/graphql/type";
import { initializeApollo } from "@/lib/apollo/apolloClient";
import { GetServerSideProps } from "next";

const Home = ({ data }: { data: HelloworldQueryType }) => {
  return (
    <main>
      <h1>{data.hello.text}</h1>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = initializeApollo();

  const { data } = await apolloClient.query({
    query: GET_HELLO_WORLD_DATA_QUERY,
  });

  return {
    props: {
      data,
    },
  };
};

export default Home;
