import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { urlpath } from "../utils/apiUtils"
import axios from "axios"
import { getErrorCode, getErrorMsg } from "../utils/commonUtils"
import "../css/FindUserInfo.css"

const FindUserInfo = () =>{
    const [params, setParams] = useSearchParams()
    const mode = params.get("mode")
    const url = urlpath + `/findInfo/${mode}`


    return (
        <div className="findUserInfoContainer">
            <div className = "findUserInfoBox findUserInfoTop">
                <button className = {`findUserInfoBoxButton ${mode == "id" && "findUserInfoBoxButtonSelector"}`} onClick={() => setParams({"mode": "id"})}>아이디 찾기</button>
                <button className = {`findUserInfoBoxButton ${mode == "pw" && "findUserInfoBoxButtonSelector"}`} onClick={() => setParams({"mode": "pw"})}>비밀번호 찾기</button>
            </div>

            <div className = "findUserInfoBox">
            {
                mode == "id" ?  
                <FindUserInfoId url = {url} /> : 
                <FindUserInfoPw url = {url} />
            }
            </div>
        </div>
    )
} 

function FindUserInfoId({url}){
    const [email, setEmail] = useState();
    const [username, setUsername] = useState("");

    function submitHandler(e){
        const data = {
            email: email
        }

        axios.post(url, data).then(res => {

            const username = res.data.username
            window.alert("아이디 찾기를 완료하였습니다\n아이디: " + username);
            setUsername(username)

        }).catch(err => {

            const errcode = getErrorCode(err)
            const errmsg = getErrorMsg(err)
            console.log(errcode, errmsg)

            window.alert("아이디 찾기 실패\n" + errmsg)
            setUsername("")
        })
    }


    return (
        <div className = "findUserInfoIdContainer">
            <label>이메일</label>
            <input className = "findUserInfoInput" placeholder = "이메일을 입력하세요" name = "email" value = {email} onChange = {(e) => {console.log("이메일 인풋 태그 변경 - " + e.target.value, email); setEmail(e.target.value)}}></input>
            <input className = "findUserInfoInput" type = "submit" onClick = {submitHandler} value = "확인"></input>
            {username && <p>아이디: {username}</p>}
        </div>
    )
}
function FindUserInfoPw({url}){
    const [username, setUsername] = useState();
    const [pwd, setPwd] =useState("");


    function submitHandler(e){
        const data = {
            name: username
        }

        axios.patch(url, data).then(res => {

            const pw = res.data.password
            window.alert("비밀번호를 초기화하였습니다\n임시 비밀번호를 통해 로그인하세요\n비밀번호: " + pw);
            setPwd(pw)
        
        }).catch(err => {

            const errcode = getErrorCode(err)
            const errmsg = getErrorMsg(err)
            console.log(errcode, errmsg)

            window.alert("비밀번호 찾기 실패\n" + errmsg)

            setPwd("")
        })
    }


    return (
        <div className="findUserInfoPwContainer">
            <label>아이디/닉네임</label>
            <input className = "findUserInfoInput" placeholder = "아이디 정보를 입력하세요" name = "username" value = {username} onChange = {(e) => {console.log("닉네임/아이디 인풋 태그 변경 - " + e.target.value, username); setUsername(e.target.value)}}></input>
            <input className = "findUserInfoInput" type = "submit" onClick = {submitHandler} value = "확인"></input>
            {pwd && <p>임시 비밀번호: {pwd}</p>}
        </div>
    )
}

export default FindUserInfo;