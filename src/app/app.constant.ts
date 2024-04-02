import { CdkTreeModule } from "@angular/cdk/tree";

export class Constants {
    public static BLANK = '';
    public static USER_INFO = 'iuo';
    public static DBOARD_TYPE = 'dboardType';
    public static ACCESS_TOKEN = 'ian';
    public static BEARER_TOKEN = 'ibn';
    public static RETURN_URL = 'rul';
    public static ROUTES = 'rts';
    public static SESSION_ID = 'ssid';
    public static SR_ID = "srid";
    public static SR_DETAILS = "sr_details";
    public static IS_NEW_ADDRESS = "isNewAddress";
    // public static PROJECT_ID = 'ff0ae4a6884711e9b16676fb2f2488b6';
    //public static PROJECT_ID = '8686f382257911ebb9910242ac110003';
    public static PROJECT_ID = '225b33d6227c11ecb5bb0242ac110005';
    public static CC_BYOC_Project_ID = '1fee8ef2c8bb11ea9801a60eed3a40b9'
    public static PARAM_DATA = 'prms';
    public static InterceptorSkipHeader = 'X-Skip-Interceptor';
    public static VALIDATION_ALPHANUMERIC = /^[a-zA-Z0-9 ]+$/;    //!~{}|[]^_;:?()*,-.=@#$
    public static VALIDATION_PASSWORD = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!~^_;:,-.=*#?|])[A-Za-z\\d@$!~^_;:,-.=*#?|]{1,}$";
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
    // public static V3PROJECT_ID = 'a2892424939711ebb2260242ac110005'; // v3 master
    // public static V2PROJECT_ID = 'c42c47786f4311eb96390242ac110005'; // v2 master
    public static V3PROJECT_ID = 'a22430a0d36111eba2340242ac110005'; //v3 appId
    public static V2PROJECT_ID = '4590c642772611eb90c00242ac110005'; //v2 appId
}

export module APIConstants {

    export enum outwardRemittanceSubmitSr {
        PROCESS_ID = 'e0c4fafaaeb211eda2850242ac110004',
        WORKFLOW_ID = '63ef5fe6dd133d736be2a136'
    }

}

export class AlertMessages {
    public static SOMETHING_WRONG = 'Some technical error occurred, please try after sometime';
    public static CC_limit_ehancement_not_available = 'Limit Enhancement facility is currently not available on your Credit Card. Please try again later.'
    public static SERVER_ERROR = 'Server error, Please try again shortly.';
    public static SESSION_EXPIRED = 'Current session expired due to either logged in on different session or session timeout.';
    public static SESSION_LOGOUT = 'Logout Successfully';
    public static MANDATORY_FIELDS_ALERT = 'Please fill all the mandatory fields.';
    public static CC_OnBackToHomeButton = 'Are you sure you want to cancel this request';
    public static Otp_success = ' Execution Successfull, Valid Login';
    public static otp_error = 'Execution failed, Invalid credentials/ Invalid session/ Insufficient data/ Reached retry limit'
    public static invalid_otp = 'Invalid OTP, Please try again';
    // public static invalid_otp = 'Invalid OTP, Please try again with valid OTP.';
    public static invalid_Credentials = 'Invalid Credentials';
    public static service_underProgress = 'Your service request for selected service is under process.';
    public static email_sent_msg = 'An email with a verification link has been sent to your new email account. Please click on the link to complete the process. Post successful completion of the validation, this Service Request will be processed and your email id updated in our records in one working day.';
    public static not_found_customer_MOBILE_NO = 'Please register your Mobile number to avail this service. For details, write to yestouch@yesbank.in or visit your nearest YES BANK branch.';
    public static data_not_found = 'Data not found';
    public static invalid_pan = 'Invalid PAN / Failed to get data';
    public static invalid_email = 'Invalid Email ID / Failed to get data';
    public static invalid_landline = 'Invalid Landline Number';
    public static not_equal_landline_number = 'Old and New Landline Number does not Match';
    public static resend_OTP_success = 'OTP has been re-sent on your registered mobile number.';
    // public static resend_OTP_success = 'OTP has been resent to your registered mobile number.';
    public static otp_attempt_failed = 'You have reached your maximum attempts limit. Please re-try after 24 hrs.';
    public static CC_already_request = 'You have already raised a service request for the selected Credit Card and same is under process';
    public static Cc_createSR_401 = 'We are currently facing some technical issue. Please try again  after 48 hours. In case of any urgent requests, please call Customer Care.'
    public static cc_email_401 = 'We are currently facing some technical issue. Please try again  after 60 hours. In case of any urgent requests, please call Customer Care.';
    public static user_block = 'This customer ID is blocked, Please try after 24 hours';
    public static credit_card_user_block = 'Invalid OTP, You have reached the maximum number of attempts. Please retry after 24 hours.';
    public static CC_user_block = 'Sorry,this Customer ID is currently blocked. Please try after 24 hours';
    public static CC_user_block_msg = 'Invalid OTP, You have reached the maximum number of attempts. Please retry after 24 hours.';
    public static SESSION_NOT_GENERATE = "Session is not generate, Please try again.";
    public static CUSTOMER_NOT_IDENTIFIED = 'Cannot Identify with details. Please enter correct details';
    public static SAME_EMAIL_ERROR = "New Email ID entered is same as Existing Email ID, Kindly enter different Email ID to proceed.";
    public static SAME_PAN_ERROR = "New PAN entered is same as Existing PAN, Kindly enter different PAN to proceed.";
    public static SR_IN_PROGRESS_ERROR = "Your service request for selected service is under process.";
    public static EXECUTAION_FAILD = "Execution failed, duplicate reference id.";
    public static submit_FD_renewal = "Service request for FD Renewal is submitted successfully"
    public static aacount_not_found = 'Account Details Not found';
    public static NA_BANK_MSG = 'Not available in the Bank records';
    public static REQUIRED_FIELD_MSG = 'This field is required.';
    public static invalid_Credit_Card = 'Invalid Credit Card Details. Please re-enter the details.';
    public static already_submitted = 'Your service request for FD renewal service is already submitted.';
    public static max_retry = 'You have reached your maximum attempts limit. You may retry next calendar day.'
    public static non_pan_message_FD = 'Amount cannot be more than Rs.49999,Please update your PAN';
    // public static VALIDATION_REGX_TEXTFIELD_ERR_MSG = `Only ,' .-''_""()&[]/ special characters allowed.`
    public static VALIDATION_REGX_TEXTFIELD_ERR_MSG = `Only ,.\-_#@ special characters allowed.`
    // public static NO_MOBILE_NO_EMAIL = 'Request you to register your Mobile number / Email for availing service. For details contact 18001200 or write to yestouch@yesbank.in or visit to nearest YES BANK branch.';
    public static NO_MOBILE_NO_EMAIL = 'Please register your Mobile number and Email to avail this service. For details, write to yestouch@yesbank.in or visit your nearest YES BANK branch.';
    public static NO_EMAIL = 'Please register your Email to avail this service. For details, write to yestouch@yesbank.in or visit your nearest YES BANK branch.';
    public static NO_MOBILE = 'Please register your Mobile number to avail this service. For details, write to yestouch@yesbank.in or visit your nearest YES BANK branch.';
    public static USER_BLOCKED = 'This Customer ID has been Blocked. For details contact 18001200 or write to yestouch@yesbank.in or visit to nearest YES BANK branch.';
    public static RESEND_OTP_MESSAGE = 'OTP has been sent on your registered mobile number.';
    public static SENT_OTP = 'OTP has been sent on your registered mobile number';
    public static ALREADY_RAISED_REQUEST = 'Your service request for selected service is under process.';
    public static cc_ALREADY_RAISED_REQUEST = 'You have already raised a service request for the selected Credit Card and the same is under process.'
    public static RA_ALREADY_RAISED_REQUEST = 'Your service request for selected service is under process.';
    public static RA_INVALID_OTP = 'Invalid OTP. Please try again.';
    public static RA_RESEND_OTP = 'OTP has been re-sent on your registered mobile number.';
    public static RA_MAX_ATTEMPTS = 'You have reached your maximum attempts limit. Please re-try after 24 hrs.';
    public static account_dornmant = 'Account is dornmant';
    public static invalid_captcha = 'Invalid captcha, Please try again';
    public static INVALID_SERVICE_REQUEST = 'Invalid service request';
    public static LINK_EXPIRED = 'The link has been expired';
    public static invalid_session = 'Execution failed. Invalid session.';
    public static NO_FD_ACCOUNTS = 'There are no Fixed Deposits for renewal';
    public static FAILED_TO_INITIATE_OTP = 'Failed to initiate OTP, please retry after some time';
    public static DEMAT_NO_ACCOUNT = 'Eligible Savings account is missing. Please visit nearest YES BANK branch';
    public static AADHAAR_OTP_INITIATE = 'Failed to initiate Aadhaar OTP. Please try again after 15 minutes';
    public static ANOTHER_SR_IN_PROGRESS = 'Your earlier service request is under process. Request you to wait for the same to be fulfilled before raising a new one.';
    public static DORMANT_ACCOUNT = 'Dear Sir/Madam , The service request cannot be processed online.Please reach out to branch for availing the service';
    public static AUS_ACCOUNT = 'Dear Customer,Currently Authorised signatory are not allowed to process with this service request.Kindly visit branch ';
    public static PAN_UNAVAILABLE_ACCOUNT = 'Regret inconvenience, Please contact your RM/nearest branch for further assistance';
    public static RA_IT_SERVICE_NOT_AVAILABLE = 'This service request is not available for this Loan Account Number';
    public static INTENSE_ACCOUNT_DETAILS_NOT_AVAILABLE = 'Regret inconvenience, We are unable to retrieve the statement for the selected account no. Please contact your RM/nearest branch for further assistance';
    public static NON_INDIVIDUAL_ACCOUNT = 'Execution failed, customer is not eligible';
    public static MINOR_ACCOUNT = 'Dear Customer, Currently <Relationship type/Exclusions> are not allowed to proceed with this service request on YES Service Portal. Request you to kindly contact Branch or RM for assistance';
    public static FINNONE_ERROR_CODE_500 = 'Something went wrong with Finnone';
    public static CC_NO_OFFER_MESSAGE = 'Currently there is no offer available for selected Card. Please try again after sometime.';
    public static PAN_ERROR = 'PAN no is mandatory for FD booking since cumulative deposit amount is greater than 5 lakhs.';
    public static MAX_LIMIT = 'Maximum 3 allowed';
    public static PAN_ERROR_MESSAGE = 'PAN no is mandatory for FD booking since deposit amount is greater than or equal to 50000.'
    public static CC_SEC_CARD_MSG = 'The request of these services/ offers need to be raised by the Primary Card member only. Sorry for the inconvenience caused.';
    public static CC_EMAIL_DIALOG_MSG = 'An email with verification link has been sent to your new email account. Please click on the link to complete the process. Post successful completion of the validation, this Service Request will be processed and your email id updated in our records in one working day.';
    public static CC_ADDON_CARD_MSG = 'Primary card holder only to authenticate for setting up card controls';
    public static INVALID_OTP_MAX_ATMPT = "Invalid OTP, You have reached your maximum attempts limit. Please re-try after 24 hrs";
    public static MANDATORY_ERR_MSG = "Please fill all mandatory feilds";
    public static DEDUP_FAILURE_ERR_MSG = "We are currently facing some technical issue.";
    public static MOBILE_NO_ERR_MSG = "Please register your Mobile number to avail this service. For details, write to yestouch@yesbank.in or visit your nearest YES BANK branch.";
    public static ETB_NO_VALID_OFFERS = "Failed, no valid offers on this card";
    public static FAILED_TO_INITIATE_CON_OTP = "Failed to initiate OTP";
    public static FAILED_TO_RESEND_OTP = "Failed to resend OTP";
    public static NOT_SERVICABLE_ADDR = "Thank you for showing interest! Our representative will contact you shortly for completing further formalities pertaining to your application!";
    public static DEDUP_APPR_DEC = "Already Applied for Credit Card, Under Process/Rejected";
    public static CUST_BLOCK = "This CustomerID is blocked please try again after 24 hrs"
    public static CMG_SOON = "Coming Soon";
    public static CC_ETB_CREATE_SR_401 = 'We are currently facing some technical issue. Please try again  after 24 hours. In case of any urgent requests, please call Customer Care.'
    public static RL_NOM_NOT_AVAIL = 'Unable to retrieve Nominee details. Please try after sometime'
    public static DEMAT_ACCOUNT_HAS_BALANCE = 'You have Balances in your Demat account. Kindly visit YES BANK branch for submitting the closure request.';
    public static INVALIDCONTENTTYPE = 'Invalid content type of file';
    public static OUTWARDBALANACECHECK = 'You do not have sufficient funds in your account to remit the funds. Please fund your account sufficiently to continue with the transaction.';
    public static EXPIREDSESSION = 'Current session expired/timeout';
    public static LRS_MAX_RETRY = 'You have reached your maximum attempts limit.';
    public static CC_INVALID_LOGO = 'Dear Customer, Card Control change request cannot be placed through this mode, you are requested to contact your Authorised Corporate Signatory';
    public static BYOCNOTALLOWED = "Dear Customer, BYOC change request cannot be placed through this mode, you are requested to contact your Authorised Corporate Signatory";
    public static APPSEC_WEAK_INPUT = "Unsafe elements found in address details";
    public static AMOUNTENTER = "Please enter amount of currency for remittance";
}

export class ApplicationVersion {
    // 00.17.22
    // 00 - PROD
    // 17 - UAT
    // 22 - DEV
    public static APP_VERSION = "v84.1.1";
}

//'/non-financial/loan' 2
export const ALL_TABS: Array<string> = ['/non-financial/retail-banking', '/non-financial/credit-card', '/non-financial/demat', '/non-financial/corporate', '/non-financial/nri-rekyc'];
export const REDIRECT_URL = 'https://yesonline.yesbank.co.in/';


// true = Enable Dummy Values
// false = Disable Dummy Values
export const dematIsDummy: boolean = false; // Demat

export const casaIsDummy: boolean = false;

export const casaInntense: boolean = false;

export const IS_DEV: boolean = false;

export const nreRekycIsDummy: boolean = false; // NRE Rekyc
