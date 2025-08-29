import AbiForm from "./abi-form";
import AbiViewer from "./abi-viewer";

const AbiHandler = () => {
  return (
    <div className="w-full col-span-3 flex flex-col gap-4">
      <AbiForm />
      <AbiViewer />
    </div>
  );
};

export default AbiHandler;
