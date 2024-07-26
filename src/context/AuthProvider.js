import { createContext, useState, useRef, useEffect} from "react"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"


function AuthProvider({children}){
    /*
        localStorage에 토큰 저장 및 읽어오기
        토큰(권한 확인)으로 유저 페이지 렌더링
        토큰이 만료되거나 이상하면 접근 막기
    */    
    const authheader = useRef(localStorage.getItem("Authentication"))
    const [user, setUser] = useState({})

    useEffect(() => {
        // console.log(authheader.current)
        getUserInfo().then((data) => {
            setUser(data)
        })
    }, [])

    function settingToken(token){
        // header값 설정
        console.log("setting token: " + token)
        localStorage.setItem("Authentication", token)
        authheader.current = token

        getUserInfo().then((data) => {
            setUser(data)
        })
    }
    
    const getUserInfo = async () => {
        // user info값 설정
        const authmeApi = urlpath + "/auth/me"
        const header = {"Authentication": authheader.current}
        console.log(header)
        // api 호출
        try{
            const res = await axios.get(authmeApi, {headers : header})

            console.log(res.data)
            return res.data
        }catch(err){
            console.log(err)

            return undefined
        }
        
    }

    function gettingToken(){
        return authheader.current
    }  

    function gettingUserEmail(){
        return user && user.email 
    }

    function gettingUsername(){
        return user && user.username
    }

    
    const value = {gettingToken, settingToken, gettingUserEmail, gettingUsername}

    return (
        <AuthContext.Provider value = {value}>{children}</AuthContext.Provider>
    )
}

export const AuthContext = createContext()
export default AuthProvider