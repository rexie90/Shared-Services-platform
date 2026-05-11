export class ApiResponse {
  constructor(statusCode, data, message = 'تمت العملية بنجاح') {
    this.statusCode = statusCode
    this.success    = statusCode < 400
    this.message    = message
    this.data       = data
  }
}
