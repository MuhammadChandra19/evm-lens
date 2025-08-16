  export const generateRandomAddress = () => {
    const randomAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return randomAddress
  };