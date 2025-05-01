class ApiResponse{
    constructor( statuscode, data,massage = "success" ) {

        this.statuscode = statuscode
        this.data = data
        this.massage = massage
        this.success = statuscode < 400
    }
}

export { ApiResponse }