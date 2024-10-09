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
    const [user, setUser] = useState({
        id: "",
        username: "",
        email: ""
    })

    useEffect(() => {

        getUserInfo()

    }, [])

    function settingToken(token){
        // header값 설정
        console.log("setting token: " + token)
        localStorage.setItem("Authentication", token)
        authheader.current = token

        getUserInfo()
    }
    
    const getUserInfo = async () => {
        // user info값 설정
        const authmeApi = urlpath + "/auth/me"
        const header = {"Authentication": authheader.current}

        // api 호출
        try{
            const res = await axios.get(authmeApi, {headers : header})

            console.log(res.data)
            
            setUser(res.data)
        }catch(err){
            console.log(err)
            removeToken()

            setUser({
                id: "",
                username: "",
                email: ""
            })
        }
        
    }

    const removeToken = () => {
        localStorage.removeItem("Authentication")
        authheader.current = ""
    }

    function gettingToken(){
        return authheader.current
    }  

    function gettingUserEmail(){
        return user.email 
    }

    function gettingUsername(){
        return user.username
    }

    function gettingUserId(){
        return user.id
    }

    
    const value = {gettingToken, settingToken, gettingUserEmail, gettingUsername, gettingUserId, getUserInfo}

    return (
        <AuthContext.Provider value = {value}>{children}</AuthContext.Provider>
    )
}

export const AuthContext = createContext()
export default AuthProvider