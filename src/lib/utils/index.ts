export const generateRandomAddress = () => {
  const randomAddress =
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  return randomAddress;
};

export const extractUint256 = (value: Uint8Array<ArrayBufferLike>): bigint => {
  if (value && value.length >= 32) {
    const bytes = value.slice(0, 32);
    let result = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
      result = (result << BigInt(8)) + BigInt(bytes[i]);
    }
    return result;
  }
  return BigInt(0);
};

export const extractString = (value: Uint8Array<ArrayBufferLike>): string => {
  if (!value || value.length === 0) {
    return "";
  }

  try {
    // For dynamic types like string, the first 32 bytes contain the offset
    // The next 32 bytes contain the length
    // The actual string data follows
    if (value.length >= 64) {
      const lengthBytes = value.slice(32, 64);
      const length = Number(extractUint256(lengthBytes));

      if (length > 0 && value.length >= 64 + length) {
        const stringBytes = value.slice(64, 64 + length);
        return new TextDecoder("utf-8").decode(stringBytes);
      }
    }

    // Fallback: try to decode the entire value as string
    // Remove null bytes and decode
    const nonNullBytes = Array.from(value).filter((byte) => byte !== 0);
    if (nonNullBytes.length > 0) {
      return new TextDecoder("utf-8").decode(new Uint8Array(nonNullBytes));
    }

    return "";
  } catch (error) {
    console.warn("Failed to decode string:", error);
    return "";
  }
};

export const extractBool = (value: Uint8Array<ArrayBufferLike>): boolean => {
  if (!value || value.length === 0) {
    return false;
  }

  // Boolean is encoded as uint256, where 0 = false, anything else = true
  const uint256Value = extractUint256(value);
  return uint256Value !== BigInt(0);
};

export const extractAddress = (value: Uint8Array<ArrayBufferLike>): string => {
  if (!value || value.length < 32) {
    return "0x0000000000000000000000000000000000000000";
  }

  // Address is stored in the last 20 bytes of a 32-byte word
  const addressBytes = value.slice(12, 32);
  const hexString = Array.from(addressBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hexString}`;
};

export const extractBytes = (value: Uint8Array<ArrayBufferLike>): string => {
  if (!value || value.length === 0) {
    return "0x";
  }

  // For dynamic bytes, similar to string encoding
  if (value.length >= 64) {
    const lengthBytes = value.slice(32, 64);
    const length = Number(extractUint256(lengthBytes));

    if (length > 0 && value.length >= 64 + length) {
      const bytesData = value.slice(64, 64 + length);
      const hexString = Array.from(bytesData)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      return `0x${hexString}`;
    }
  }

  // Fallback: return the entire value as hex
  const hexString = Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hexString}`;
};

/**
 * Parse ABI function return value based on output type
 */
export const parseAbiReturnValue = (
  returnValue: Uint8Array<ArrayBufferLike>,
  outputType: string,
): string => {
  if (!returnValue || returnValue.length === 0) {
    return "";
  }

  // Normalize the type (remove array indicators and size specifiers for basic parsing)
  const baseType = outputType.replace(/\[\d*\]$/, "").toLowerCase();

  try {
    switch (true) {
      // Unsigned integers
      case baseType.startsWith("uint"):
        return extractUint256(returnValue).toString();

      // Signed integers (treat as uint for now, could be enhanced)
      case baseType.startsWith("int"):
        return extractUint256(returnValue).toString();

      // Boolean
      case baseType === "bool":
        return extractBool(returnValue).toString();

      // Address
      case baseType === "address":
        return extractAddress(returnValue);

      // String
      case baseType === "string":
        return extractString(returnValue);

      // Bytes (dynamic)
      case baseType === "bytes":
        return extractBytes(returnValue);

      // Fixed-size bytes (bytes1, bytes2, ..., bytes32)
      case /^bytes\d+$/.test(baseType): {
        const hexString = Array.from(returnValue.slice(0, 32))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        return `0x${hexString}`;
      }

      // Default: treat as uint256
      default:
        console.warn(`Unknown output type: ${outputType}, treating as uint256`);
        return extractUint256(returnValue).toString();
    }
  } catch (error) {
    console.error(
      `Failed to parse return value for type ${outputType}:`,
      error,
    );
    // Fallback to raw hex representation
    const hexString = Array.from(returnValue)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return `0x${hexString}`;
  }
};
