import { CdkTreeModule } from "@angular/cdk/tree";

export class Constants {
    public static ACCESS_TOKEN= "";
    public static BEARER_TOKEN= "";
    public static SESSION_ID= "";
    public static BLANK = '';
    public static PARAM_DATA = "";
    public static ROUTES = "";
    public static InterceptorSkipHeader = 'Skip-Interceptor';
    public static VALIDATION_ALPHANUMERIC = /^[a-zA-Z0-9 ]+$/;    //!~{}|[]^_;:?()*,-.=@#$
    public static VALIDATION_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // public static VALIDATION_REGX_TEXTFIELD = /^[a-zA-Z0-9 ,'.\-''_""()\/&[\]]+$/;
    public static VALIDATION_REGX_TEXTFIELD = /^[a-zA-Z0-9 ,.\-_#@]+$/;
    public static VALIDATION_REGX_NUMBER = /^[0-9]+$/;
    public static VALIDATION_REGX_STD_NUMBER = /^[1-9][0-9]*$/;
    public static Validation_address_regex = /^[a-zA-Z0-9\s,/().\\'-]*$/
    public static Validation_letters_only = /^[a-zA-Z ]*$/;
    public static Validation_single_Space_letters_only = /^[a-zA-Z]*$/;
    public static Aadhar_number_validation = /^\d{12}$/;
    public static VALIDATION_REGX_PAN_NUMBER = /[A-Za-z]{5}\d{4}[A-Za-z]{1}/;
    //                                        1st digit 2-to-9 and after that it can be 0 to 9  
    public static VALIDATION_REGEX_LANDLINE_NUMBER = /^[1-9][0-9]/;
    public static VALIDATION_REGX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    public static VALIDATION_REGX_IFSC = /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/;
}

export module APIConstants {

    export enum test {
        PROCESS_ID = '',
        WORKFLOW_ID = ''
    }

}

export class AlertMessages {
    public static SOMETHING_WRONG = 'Some technical error occurred, please try after sometime';
    public static SERVER_ERROR = 'Server error, Please try again shortly.';
    public static SESSION_EXPIRED = 'Current session expired due to either logged in on different session or session timeout.';
    public static SESSION_LOGOUT = 'Logout Successfully';
    public static MANDATORY_FIELDS_ALERT = 'Please fill all the mandatory fields.';
    public static INVALIDCONTENTTYPE = 'Invalid content type of file';
}

export class ApplicationVersion {
    public static APP_VERSION = "v1.1.1";
}

export const IS_DEV: boolean = false;