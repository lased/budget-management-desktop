import { SelectItem } from 'primeng/api';
import { FormControl } from '@angular/forms';

export type InputType = 'checkbox' | 'text' | 'select' | 'datetime' | 'number' | 'textarea' | 'password' | 'daterange';
export interface InputComponentOptions {
    label?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    mask?: string;
    optionLabel?: string;
    type?: InputType;
    options?: SelectItem[] | any[];
    control?: FormControl;
    selected?: (event: any) => void;
}
