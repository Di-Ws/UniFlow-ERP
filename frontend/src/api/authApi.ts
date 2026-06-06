import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`
});


export const loginUser =
(data: {

  email: string;
  password: string;

}) =>

  API.post(
    "/auth/login",
    data
  );


export const registerUser =
(data: {

  name: string;
  email: string;
  password: string;

}) =>

  API.post(
    "/auth/register",
    data
  );


export default API;