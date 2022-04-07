import { Request } from 'express';

export interface TypedRequestBody<T> extends Request {
    body: T;
}

export interface CreateWitnessReport {
	title: string;
	phoneNumber: string;
}