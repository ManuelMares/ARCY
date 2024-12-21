import { ButtonTypeEnum } from "../ENUMS/ButtonTypeEnum";

export interface IActivityLog{
    button: string;
    session_time_stamp_string: string;
    type: ButtonTypeEnum
}