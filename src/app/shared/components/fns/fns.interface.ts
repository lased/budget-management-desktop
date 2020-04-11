export type TypeFnsForm = 'login' | 'register' | 'restore';

export class FnsRequestError {
    status: number;
    message: string;

    constructor(status: number, message: string){
        this.status = status;
        this.message = message;
    }
}
