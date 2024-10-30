import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"
import { getErrorCode, getErrorMsg } from "../utils/commonUtils"
import Error from "./Error"
import "../css/UserSetting.css"
import qs from "qs"

export default function UserSetting(){

    const { gettingToken, settingToken, getUserInfo, gettingUserEmail, gettingUsername, gettingUserPasswordIsNull } = useContext(AuthContext)
    const [token, name, email, passwordIsNull] = [gettingToken(), gettingUsername(), gettingUserEmail(), gettingUserPasswordIsNull()]    
    
    const urllogout = urlpath + "/logout"
    const urlsetting = urlpath + `/${name}/setting`

    const [error, setError] = useState(false)
    const [passwordErrorMsg, setPasswordErrorMsg] = useState("")
    const [user, setUser] = useState({
        name: "", // 닉네임
        email: "", // 이메일
        curr_password: "", // 패스워드
        change_password: "", // 패스워드
        re_change_password: "" // 패스워드
    }) // input

    useEffect(() => {

        console.log("변화감지!!!")
    }, [gettingToken])

    // 로그아웃 핸들러
    function handlelogout(e){
        const confirmOk = window.confirm("로그아웃하시겠습니까?")

        if(!confirmOk){
            return 
        }


        const header = {
            "Authentication": token
        }

        // 서버측 회원 초기화
        axios.get(urllogout, {headers: header}).then(res => {

            window.alert("로그아웃. 홈 화면으로 이동합니다")

            // 클라이언트(브라우저) 토큰 초기화
            settingToken("")

            // 홈화면 라우팅
            window.location.pathname = "/"

        }).catch(err => {

            const code = getErrorCode(err)
            window.alert("error - 로그아웃 실패")       
            console.log(err)

            if(code == 401 || code == 403){ // UNAUTHORIZED or FORBIDDEN (토큰이 만료되거나 블랙리스트 처리되었을경우) 
                setError(true)
                getUserInfo()
            }
            
        })
    }

    // 탈퇴 핸들러
    function handleDelete(e){
        const confirmOk = window.confirm("정말 탈퇴하시겠습니까?")

        if(!confirmOk){
            return 
        }


        const header = {
            "Authentication": token
        }

        // 서버측 회원 초기화
        axios.delete(urlsetting, {headers: header}).then(res => {

            window.alert("계정을 탈퇴하였습니다. 홈 화면으로 이동합니다")

            // 클라이언트(브라우저) 토큰 초기화
            settingToken("")

            // 홈화면 라우팅
            window.location.pathname = "/"

        }).catch(err => {

            const code = getErrorCode(err)
            window.alert("error - 탈퇴 실패")       
            console.log(err)

            if(code == 401 || code == 403){ // UNAUTHORIZED or FORBIDDEN (토큰이 만료되거나 블랙리스트 처리되었을경우) 
                setError(true)
                getUserInfo()
            }
            
        })
    }

    // 수정 핸들러
    function handleSetting(e){
        const {name, value} = e.target

        if(name == "re_change_password"){
            if(value != user.change_password){
                setPasswordErrorMsg("비밀번호가 일치하지 않습니다")
            }else {
                setPasswordErrorMsg("")
            }
        }

        setUser({
            ...user,
            [name]: value
        })
    }

    // 수정완료 핸들러(버튼)
    function handleSettingButton(e){
        const confirmOk = window.confirm("변경하시겠습니까?")

        if(!confirmOk){
            return 
        }

        const header = {
            Authentication: token
        }
        const {query, data} = getSettingQueryAndData()

        axios.patch(urlsetting, data, {headers: header, params: query, paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"})}).then(res => {
            
            window.alert("회원정보 수정 완료")

            // 토큰 
            // header 값 저장
            const headers = res.headers
            const token = headers["authentication"] || headers["Authentication"] // 소문자로 들어옴..

            settingToken(token)
            setUser({
                name: "", 
                email: "", 
                curr_password: "",
                change_password: "",
                re_change_password: ""
            })

        }).catch(err => {
        
            const code = getErrorCode(err)
            const msg = getErrorMsg(err)

            if(code == 401 || code == 403){ // UNAUTHORIZED or FORBIDDEN (토큰이 만료되거나 블랙리스트 처리되었을경우) 
                setError(true)
                getUserInfo()
            }

            
            window.alert(`error - 회원 정보 수정 살패\n${msg}`)

            console.log(err)
        })

    }

    function getSettingQueryAndData(){
        const q = []
        const d = {}

        if(user.name != ""){
            q.push("changeNickname")
            d["name"] = user.name
        }
        if(user.email != ""){
            q.push("changeEmail")
            d["email"] = user.email
        }
        if(user.change_password != ""){
            q.push("changePassword")
            d["password"] = user.change_password

            if(!passwordIsNull) d["originalPassword"] = user.curr_password 
        }
        
        return {
            query: {mode: q},
            data: d
        }
    }


    if(error || name == ""){
        return (
            <Error 
                status = "400"
                message = "잘못된 접근입니다"
            />
        )
    }

    return (
        <div className = "userSettingContainer">
            <div className = "userSettingBox">
                <div>내 계정</div>
                <button onClick = {handlelogout} className = "userSettingBtn">로그아웃</button>
                <button onClick = {handleDelete} className = "userSettingBtn">탈퇴하기</button>
                
                <ul className = "userSettingUl">
                    <li>
                        <div>닉네임</div>
                        <input type = "text" placeholder = {name} name = "name" value = {user.name} onChange = {handleSetting}></input>
                    </li>
                    <li>
                        <div>이메일</div>
                        <input type = "text" placeholder = {email} name = "email" value = {user.email} onChange = {handleSetting}></input>
                    </li>
                    <li>
                        <div>비밀번호</div>
                        <input type = "password" placeholder = "기존 비밀번호를 입력하세요" name = "curr_password" value = {user.curr_password} onChange = {handleSetting} disabled = {passwordIsNull}></input>
                        <input type = "password" placeholder = "변경할 비밀번호를 입력하세요" name = "change_password" value = {user.change_password} onChange = {handleSetting}></input>
                        <input type = "password" placeholder = "다시 입력하세요" name = "re_change_password" value = {user.re_change_password} onChange = {handleSetting}></input>
                    </li>
                </ul>

                <div>
                    {passwordErrorMsg}
                </div>
                <button onClick = {handleSettingButton} className = "userSettingBtn" disabled = {user.change_password != user.re_change_password}>수정 완료</button>
            </div>
        </div>
    )
}