export const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
export const isEmpty = (value) => value.trim() === "";