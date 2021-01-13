export const objToEncodedURI = (obj: any) => {
  return Object.entries(obj)
    .filter(([, paramValue]) => typeof paramValue !== 'undefined')
    .map(
      ([paramKey, paramValue]) =>
        `${encodeURIComponent(paramKey)}=${encodeURIComponent(String(paramValue))}`
    )
    .join('&');
};
