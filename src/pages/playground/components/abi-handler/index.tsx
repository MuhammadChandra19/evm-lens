import AbiForm from "./abi-form";
import AbiViewer from "./abi-viewer";

const AbiHandler = () => {
  return (
    <div className="w-full grid grid-cols-2 gap-4 h-96">
      <AbiForm />
      <AbiViewer />
    </div>
  );
};

export default AbiHandler;
