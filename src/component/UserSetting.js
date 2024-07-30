import { useContext } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"

export default function UserSetting(){
    const { gettingToken, settingToken } = useContext(AuthContext)
    const token = gettingToken()
    const url = urlpath + "/logout"

    function logoutHandler(){
        const header = {
            "Authentication": token
        }
        // 서버측 회원 초기화
        axios.get(url, {headers: header}).then(res => {
            console.log("로그아웃 성공")
            window.alert("로그아웃. 홈 화면으로 이동합니다")

            // 클라이언트(브라우저) 토큰 초기화
            settingToken("")


            // 홈화면 라우팅
            window.location.pathname = "/"
        }).catch(err => {
            console.log("로그아웃 실패")
            console.log(err)

            window.alert("error - 로그아웃 실패")
        })
    }

    return (
        <div>
            <button onClick={logoutHandler}>로그아웃</button>

        </div>
    )
}