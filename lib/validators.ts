export const validateCardNumber = (n: string) => /^\d{16}$/.test(n.replace(/\s/g, ""));
export const validateCVC = (c: string) => /^\d{3}$/.test(c);
export const validateExp = (e: string) => /^(0[1-9]|1[0-2])\/(\d{2})$/.test(e);
export const validateEmail = (e: string) => /.+@.+\..+/.test(e);