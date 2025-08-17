export const generateRandomAddress = () => {
  const randomAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
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
