import { createContext, useRef} from "react"


function HttpHeaderProvider({children}){
    /*
        localStorage에 토큰 저장 및 읽어오기
    */    
    const authheader = useRef(localStorage.getItem("Authentication"))
    const value = {gettingToken, settingToken}


    function settingToken(token){
        localStorage.setItem("Authentication", token)
        authheader.current = token
    }
    
    function gettingToken(){
        return authheader.current
    }  
    
    return (
        <HttpHeaderContext.Provider value = {value}>{children}</HttpHeaderContext.Provider>
    )
}

export const HttpHeaderContext = createContext()
export default HttpHeaderProvider