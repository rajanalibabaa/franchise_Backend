import crypto from "crypto";
const uuid = () => {
    return crypto.randomUUID();
};

export default uuid;