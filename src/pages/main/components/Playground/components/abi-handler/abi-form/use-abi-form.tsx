import { useMemo, useState } from "react";
import { Address } from "@ethereumjs/util";
import useAbiHandler from "../use-abi-handler";
import { FunctionCallFormInput } from "@/store/playground/types";

const useAbiForm = () => {
  const { activeFunction, getAccounts, handleExecute } = useAbiHandler();

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
  const [selectedAccount, setSelectedAccount] = useState<Address | null>(null);
  const [ethAmount, setEthAmount] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const accounts = useMemo(() => getAccounts(), []);

  const handleSelectAccount = (address: string) => {
    const selected = accounts.find((v) => v.address.toString() === address);
    if (selected) {
      setSelectedAccount(selected.address);
    }
  };

  const validateValues = () => {
    let isValid = true;
    for (let i = 0; i < form.length; i++) {
      const current = form[0];

      if (current.value === "") {
        isValid = false;
        setErrors((err) => {
          const copyErr = err;
          copyErr[i] = `${current.name} is Required`;

          return copyErr;
        });
      }

      if (current.type.match(/^u?int(\d+)?$/)) {
        const num = Number(current.value);
        if (!isNaN(num) && num <= 0 && !Number.isInteger(num)) {
          isValid = false;
          setErrors((err) => {
            const copyErr = err;
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
          const copyErr = err;
          copyErr[i] =
            `${current.name} Must be a valid Ethereum address (0x followed by 40 hex characters)`;

          return copyErr;
        });
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

      await handleExecute(
        {
          inputs: form,
        },
        selectedAccount,
        ethAmount,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (idx: number, value: string) => {
    setForm((v) => {
      const copyV = v;
      copyV[idx].value = value;
      return copyV;
    });
  };

  return {
    submissionForm,
    accounts,
    activeFunction,
    handleSubmit,
    handleChange,
    form,
    errors,
    setErrors,
    setEthAmount,
    setSelectedAccount,
    handleSelectAccount,
  };
};

export default useAbiForm;
