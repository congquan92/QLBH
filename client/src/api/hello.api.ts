import { axiosInstance } from "../lib/axios";

export const helloApi = {
    sayHello: () => axiosInstance.get("/hello"),
};
