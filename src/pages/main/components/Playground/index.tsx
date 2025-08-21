import Layout from "./components/layout";
import usePlayground from "./use-playground";
import FunctionForm from "./components/function-form";

const Playground = () => {
  const { activeFunction } = usePlayground();

  const Intro = () => <div></div>;
  return (
    <Layout>
      {activeFunction ? (
        <FunctionForm abiFunction={activeFunction} />
      ) : (
        <Intro />
      )}
    </Layout>
  );
};

export default Playground;
