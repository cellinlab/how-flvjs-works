const bufferToHexStr = (data: ArrayBuffer) => {
  const uint8Array = new Uint8Array(data);
  const hexArray = [];
  for (let i = 0; i < uint8Array.length; i++) {
    const hex = uint8Array[i].toString(16).padStart(2, "0");
    hexArray.push(hex);
  }
  return hexArray;
};

export { bufferToHexStr };
