import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_OPENDOTA_URL;

export const openDota = axios.create({
  baseURL,
});
