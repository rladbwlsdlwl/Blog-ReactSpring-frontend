
// 이미지 파일 미리보기 변환
// Byte 바이너리값 -> Base64
export function byteToBase64(byteurl){
    return "data:image/png;base64," + byteurl
}

// 에러 메세지 파싱
export function getErrorMsg(err){
    // default -> err {message: ""}
    // backend custom message -> err.response.data {message: "", status: int} OR err.response.data [{message: "", field: ""}, ...]  
    
    if(err.response == undefined){ // 응답 객체가 오지않음 = 네트워크 에러
        return err.message
    }

    if(Array.isArray(err.response.data)){ // 배열 파싱
        return err.response.data.map(data => `${data.field}: ${data.message}`).join("\n")
    }

    return err.response.data.message || err.message
}

// 에러 코드(status) 파싱
export function getErrorCode(err){
    if(err.response == undefined){ // 응답 객체가 오지않음 = 네트워크 에러
        return 500 // err.code
    }

    return err.response.data.status || err.response.status
}

// yyyyMMddHHmmss -> yyyy-MM-dd
export function getDateTemplate1(date){
    return date.substr(0, 4) + "-" + date.substr(4, 2) + "-" + date.substr(6, 2)
}

// yyyyMMddHHmmss -> yyyy. MM. dd HH: mm
export function getDateTemplate2(date){
    return date.substr(0, 4) + ". " + date.substr(4, 2) + ". " + date.substr(6, 2) + " " + date.substr(8, 2) + ": " + date.substr(10, 2)
}