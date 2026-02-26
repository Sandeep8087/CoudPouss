export const REGEX = {
    email: /^(?!.*\s)\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    word: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
    password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[^\s]{8,12}$/,
    phoneNumber: /[^0-9]/g,
    phoneRegex: /^\d+$/,
}
