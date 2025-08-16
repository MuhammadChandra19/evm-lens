import useEVMStore from '@/store/evm';

const Playground = () => {
  const devAddress = useEVMStore(store => store.ownerAddress)
  const functions = useEVMStore(store => store.functions)
  console.log(devAddress)
  console.log(functions)
  return (
    <div>
      <h1>EVM</h1>
    </div>
  );
};

export default Playground;
