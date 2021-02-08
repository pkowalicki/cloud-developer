import { JwtHeader } from "jsonwebtoken";
import { JwtToken } from "./JwtToken";


export interface Jwt {
    header: JwtHeader,
    payload: JwtToken
}