import { useMemo, useState, useEffect } from "react";
import { Address } from "@ethereumjs/util";
import useAbiHandler from "../use-abi-handler";
import { AbiParameter } from "@/service/evm-analyzer/abi/types";

// Define the form input type (migrated from old store)
type FunctionCallFormInput = AbiParameter & { value: string };
import { AbiFunction } from "@/service/evm-analyzer/abi/types";

const useAbiForm = () => {
  const { activeFunction, accountList, handleExecute } = useAbiHandler();
  const [selectedAccount, setSelectedAccount] = useState<Address | null>(null);
  const [ethAmount, setEthAmount] = useState("");
  const [ethError, setEthError] = useState<string | null>(null);

  const isPayable = useMemo(
    () =>
      activeFunction?.type === "function" &&
      (activeFunction.func as AbiFunction).stateMutability === "payable",
    [activeFunction?.type, activeFunction?.func],
  );

  const submissionForm = useMemo(() => {
    if (activeFunction) {
      return activeFunction.func.inputs as FunctionCallFormInput[];
    }

    return [] as FunctionCallFormInput[];
  }, [activeFunction?.func.name!]);

  const [form, setForm] = useState(submissionForm);
  const [errors, setErrors] = useState(
    Array(submissionForm.length).fill("") as string[],
  );

  // Update form when activeFunction changes
  useEffect(() => {
    setForm(submissionForm);
    setErrors(Array(submissionForm.length).fill("") as string[]);
  }, [submissionForm]);

  const handleSelectAccount = (address: string) => {
    const selected = accountList.find((v) => v.address.toString() === address);
    if (selected) {
      setSelectedAccount(selected.address);
    }
  };

  const validateValues = () => {
    let isValid = true;
    for (let i = 0; i < form.length; i++) {
      const current = form[i];

      if (current.value === "") {
        isValid = false;
        setErrors((err) => {
          const copyErr = [...err];
          copyErr[i] = `${current.name} is Required`;
          return copyErr;
        });
      }

      if (current.type.match(/^u?int(\d+)?$/)) {
        const num = Number(current.value);
        if (!isNaN(num) && num <= 0 && !Number.isInteger(num)) {
          isValid = false;
          setErrors((err) => {
            const copyErr = [...err];
            copyErr[i] =
              `${current.name} Must be a valid number (non-negative integer)`;
            return copyErr;
          });
        }
      }

      if (
        current.type === "address" &&
        !/^0x[a-fA-F0-9]{40}$/.test(current.value)
      ) {
        isValid = false;
        setErrors((err) => {
          const copyErr = [...err];
          copyErr[i] =
            `${current.name} Must be a valid Ethereum address (0x followed by 40 hex characters)`;
          return copyErr;
        });
      }
    }

    if (isPayable) {
      const eth = Number(ethAmount);
      if (!isNaN(eth) && eth <= 0 && !Number.isInteger(eth)) {
        setEthError("Must be a valid number (non-negative integer)");
      }
    }

    return isValid;
  };

  const resetErrors = () => {
    setErrors(Array(submissionForm.length).fill("") as string[]);
  };

  const handleSubmit = async () => {
    try {
      const isValid = validateValues();
      console.log(
        isValid,
        errors,
        selectedAccount,
        !isValid || !selectedAccount,
      );
      if (!isValid || selectedAccount === null) return;
      resetErrors();
      setEthError(null);
      setEthAmount("0");

      // Convert form array to Record<string, string> format
      const formData: Record<string, string> = {};
      form.forEach((input) => {
        if (input.name) {
          formData[input.name] = input.value;
        }
      });

      await handleExecute(
        formData,
        selectedAccount,
        ethAmount,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (idx: number, value: string) => {
    setForm((prevForm) => {
      const newForm = [...prevForm];
      newForm[idx] = { ...newForm[idx], value };
      return newForm;
    });
  };

  return {
    submissionForm,
    accountList,
    activeFunction,
    handleSubmit,
    handleChange,
    form,
    errors,
    setErrors,
    setEthAmount,
    setSelectedAccount,
    handleSelectAccount,
    isPayable,
    ethError,
    ethAmount,
  };
};

export default useAbiForm;
